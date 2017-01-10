# Raw Dictionary word lists

This directory contains the raw dictionaries used.  They are compiled into simple word lists with the following command:

```sh
node tools/out/app.js compile ./dictionaries/*.txt -o ../client/dictionaries/
```

or use the following script `npm run build-dictionaries`
