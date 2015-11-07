
scope-it
--------

rewrite your require statements to use a new scope.

```sh
scope-it -s @myco private-module-1 some-other-module 
```
will run a "dry run" so you can verify the changes to your code before the files are replaced.

```sh
scope-it --dry 0 -s @myco private-module-1 some-other-module 
```
adding `--dry 0` will update all the javascript file in the project!

## install

```
npm install -g scope-it
```



