vscode-linter를 적용하기 위해서는 package.json의 properties에 다음을 추가하여야 한다.

~~~
        "cjp-linter.cache": {
          "default": false,
          "description": "Cache linting results. May end up with stale results while executing commands.",
          "type": "boolean"
        },
        "cjp-linter.debug": {
          "default": false,
          "description": "Run command with debug options",
          "type": "boolean"
        },
        "cjp-linter.enabled": {
          "default": true,
          "description": "Enable or disable code linting globally",
          "type": "boolean"
        },
        "cjp-linter.linters": {
          "default": {
			 "pylint": {
              "capabilities": [
                "ignore-file"
              ],
              "command": [
                "pylint",
                "--from-stdin",
                "--output-format",
                "json",
                [
                  "$config",
                  "--rcfile",
                  "$config"
                ],
                "$file"
              ],
              "configFiles": [
                ".pylintrc"
              ],
              "enabled": true,
              "languages": [
                "python"
              ],
              "name": "pylint",
              "url": "https://www.pylint.org"
            }
		  }
		}
~~~