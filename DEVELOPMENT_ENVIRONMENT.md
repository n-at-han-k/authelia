# How to set up development environment for web ui

Run this:

```sh
  authelia-scripts suites setup Standalone     # (re)create the environment
```

To stop running:

```sh
  authelia-scripts suites teardown Standalone  # tear it all down
```

Other commands: 

```sh
  authelia-scripts suites list                 # see all available suites
  docker logs -f authelia-authelia-backend-1   # tail backend logs
```

Then visit `https://login.example.com:8080` and log in with:

```
user: john
pass: password
```

Mailpit catches emails at https://mail.example.com:8080/
