In this gist we will first show that we can beat the arc challenge
(http://www.paulgraham.com/arcchallenge.html), and then build the library that
shows how we did it. This gist is Literate Haskell and is of course executable.

Let's start with some imports (for now, you can ignore these)

> {-# LANGUAGE GADTs, TypeSynonymInstances #-}
> module ArcChallenge where
>
> import Control.Applicative
> import Control.Applicative.Error (Failing (..))
> import Control.Monad (ap)
> import Control.Monad.Identity (Identity (..))
> import Control.Monad.Reader
> import Control.Concurrent.MVar
> import Control.Monad.Trans
> import Happstack.Server.SimpleHTTP hiding (Web)
> import Text.XHtml.Strict (toHtml)
> import qualified Data.ByteString.Lazy.Char8 as B
> import qualified Data.Map as M
> import qualified Text.XHtml.Strict as X
> import qualified Text.XHtml.Strict.Formlets as F
> import qualified Happstack.Server.SimpleHTTP as H

Here's the actual program for the arc challenge. It's only 13 nodes total:

> arc = do  name <- input
>           link "click here"
>           display $ "you said: " ++ name

The nice thing about Haskell is that it has type inference. We made |input|
polymorphic, so if we want input to return integers, we can do that. 

The following  program asks for your name, asks for two integers, shows a link
"click here", shows the sum of the two integers and finally shows your name
again. If the two integers x and y couldn't be parsed as integers, you get an
error message and a continue link so that you can try again.

> arc2 = do  name  <- input
>            (x,y) <- input
>            link "click here"
>            display $ add x y
>            display $ "you said:" ++ name

The method above consists of 25 nodes total.

Here's how you run all this:

> main = runServer 8000 (M.fromList [("arc", arc), ("arc2", arc2)])

That's all there is to it. Our library is just a proof of concept, but it's
included below. It is far from finished, but the interface of a complete library
should  remain the same. If you want to know how it is currently implemented,
keep on reading.






For the sake of presentation, we consider the request body to be key/value
pairs.

> type RequestBody = [(String,String)]

In our module, a page is either a form of |a| or a basic webpage displaying
something. The first parameters for |Form| is the rendering of the form, the
second parameter is the parsing (which happens only after the user has submitted
the data). Finally, we include a |Link| constructor that displays just a link.

> data Page a where
>   Form     :: X.Html -> (RequestBody -> Failing a) -> Page a
>   Display  :: X.Html -> Page ()
>   Link     :: String -> Page ()

A web continuation is just a function from |Request| to |Result|:

> newtype Web a = Web {runWeb :: NextPage -> RequestBody -> Result a}

When running a web continuation, either the computation is completely finished,
or it displays a page with a continuation.

> data Result a  =  Done a
>                |  Problem String (Web a)
>                |  Step X.Html (Web a)


> type NextPage = String

From a single page we can calculate a function that ignores the request and
produces a |Result|:

> runPage :: Page a ->  NextPage -> RequestBody -> Result a
> runPage f@(Form msg parse) np _  = Step (makeForm msg) (Web (const (formResult (web f) . parse)))
> runPage   (Display msg)    np _  = Step (continue msg      np "Continue") (return ())
> runPage   (Link msg)       np _  = Step (continue X.noHtml np msg) (return ())

We can derive two smart constructors that lift a |Page| directly into the |Web|
type:

> display  :: X.HTML h => h -> Web ()
> display  = web . Display . toHtml
> input    :: DefaultForm a => Web a
> input    = web . uncurry Form . runForm $ form
> link     :: String -> Web ()
> link     = web . Link

The |Web| newtype can easily be made an instance of |Monad|:

> instance Monad Web where
>   return   = Web . const . const . Done
>   l >>= r  = Web $ \np req -> case (runWeb l np req) of
>                Done x       -> runWeb (r x) np req
>                Step msg l'  -> Step msg (l' >>= r) 
>                Problem msg l' -> Problem msg (l' >>= r)

From a result we can calcute some HTML and possibly a continuation:

> handleResult :: NextPage -> Result () -> (X.Html, Maybe (Web ()))
> handleResult np (Done ())           = (toHtml "Done", Nothing)
> handleResult np (Step msg cont)     = (msg, Just cont)
> handleResult np (Problem msg retry) = (continue ("Problem: " ++ msg) np "Continue", Just retry)

Finally, some code to abstract working with forms. This makes use of the
formlets library.

> type Form a = F.XHtmlForm Identity a

> runForm :: Form a -> (X.Html, [(String,String)] -> Failing a)
> runForm f = let (_, Identity html, _) = F.runFormState [] f
>                 parse env = x where (Identity x, _, _) = F.runFormState (map (fmap Left) env) f
>             in (html, parse)

> class DefaultForm i           where form :: Form i
> instance DefaultForm String  where form = F.input Nothing
> instance DefaultForm Integer where form = F.inputInteger Nothing
> instance (DefaultForm a, DefaultForm b) => DefaultForm (a,b) where 
>   form = (,) <$> form <*> form

> instance X.HTML Integer where toHtml = toHtml . show

> instance Applicative Identity where pure = return; (<*>) = ap;

The |Env| maps a URL to a continuation. In a 'real' version of this library, it
should keep continuations in the user's session.

> type Env = M.Map String (Web ())

> run :: Env -> String -> [(String, String)] -> (X.Html, Env) 
> run env page reqBody = case M.lookup page env of
>                        Nothing   -> (pageNotFound, env)
>                        Just cont ->
>                          let np = "/" ++ page
>                              result        = runWeb cont np reqBody
>                              (html, cont') = handleResult np result
>                              env' = maybe (M.delete page env) (\x -> M.insert page x env) cont'
>                          in (html, env')

> createServerPart :: Env -> IO (ServerPart Response)
> createServerPart e = do env <- newMVar e
>                         return $ ServerPartT $ handle env

> handle :: MVar Env -> ReaderT Request (WebT IO) Response
> handle env = do req <- ask
>                 let contId     = foldr const "/" (rqPaths req)
>                     formInputs = map (\(k,v) -> (k, B.unpack $ inputValue v)) $ rqInputs req
>                 e <- liftIO $ takeMVar env
>                 let (html, e') = run e contId formInputs
>                 liftIO $ putMVar env e'
>                 return $ toResponse html

> runServer :: Int -> Env -> IO ()
> runServer p env = do
>     serverPart <- createServerPart env
>     putStrLn $ "Running server at http://127.0.0.1:" ++ show  p
>     simpleHTTP (nullConf { port = p }) serverPart

Some helper functions:

> pageNotFound = X.toHtml "Page not found."

> continue :: X.HTML x => x -> NextPage -> String -> X.Html
> continue x np linkText = x X.+++ X.br X.+++ (ahref np (toHtml linkText))

> add :: Integer -> Integer -> Integer
> add = (+)

> ahref url text = X.anchor X.! [X.href url] X.<< text

> makeForm f = X.form X.! [X.method "POST"] X.<< (f X.+++ X.submit "submit" "submit")

> formResult frm (Success a)  = Done a
> formResult frm (Failure xs) = Problem (unlines xs) frm

> web = Web . runPage