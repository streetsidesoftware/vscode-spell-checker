# Settings viewer

The settings viewer is a single-page webapp using MobX, React and TypeScript with TSX.

To speed up development of the settings viewer, it is possible to run the viewer in the browser without needing to debug the extension.

Getting started

from the `_settingsViewer` directory do the following:

-   `yarn run build`
-   `yarn test` -- just to make sure everything is working as expected
-   `yarn run start:dev` -- Re-build and launch dev server.

Launching the viewer in a browser:

Open two tabs:

-   http://localhost:3000/test.html
-   http://localhost:3000/

`test.html` simulates the `webview` of the extension. It sends and responds to messages from the settings viewer.
`localhost:3000` is the interactive viewer.
