
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

## options

```
scope-it [options] [modules to scope]

Options:
  --scope, -s   the scope name or an empty scope to remove the scopes from
                matching require statements                           [required]
  --dry         set --dry 0 to save result                       [default: true]
  --colors, -c  if code output should not be highlighted set this to 0
                                                                 [default: true]
  --dir, -d     specify a module directory. defaults to your current working
                directory       [default: "/home/soldair/projects/npm/scope-it"]
  --name        set this to 0 if you do not want to also update this module's
                scope                                            [default: true]
  -h, --help    Show help                                              [boolean]
  --version     Show version number                                    [boolean]

```

## notes
  
You can use this tool to move from unscoped private modules to your own org scope and to move modules from one scope to another.

