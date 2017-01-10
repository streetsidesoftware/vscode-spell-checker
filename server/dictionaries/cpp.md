# CPP words
The cpp words where compiled using the following command:

```sh
find /usr/include -type f -exec cat {} \; | grep -o -E '[a-zA-Z_]+' | sort -u -f > ~/cwords/cpp.txt
```

This file is rather large and will need to be compiled.
