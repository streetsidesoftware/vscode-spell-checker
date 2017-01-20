# .NET

These words came from:
https://github.com/Microsoft/referencesource

Command used to pull values from the .txt summary files.
```
find /Users/jason/projects/clones/microsoft/referencesource -name *.*.txt -exec grep -o -E ^\\w.*=  {} \; > ~/projects/vscode-spell-checker/server/dictionaries/dotnet.txt
```

