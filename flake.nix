{
  description = "Authelia development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };

        # Backend: go.mod requires go 1.26. Fall back to the default `go`
        # if this nixpkgs revision doesn't yet package go_1_26.
        go = pkgs.go_1_26 or pkgs.go;

        # Frontend: web/package.json engines require node >=22.13.1 and pnpm 11.
        # pnpm is provisioned through corepack (bundled with nodejs) so the
        # exact version from web/package.json is honored.
        nodejs = pkgs.nodejs_24;

        # The repo's cmd/dev/* wrappers run `go run "$ROOT/../<name>"` with an
        # absolute path that they resolve through symlinks (pwd). When the
        # checkout is reached via a symlink (e.g. ~/src -> /mnt/.../src), that
        # absolute physical path no longer textually matches Go's main-module
        # root (which Go derives logically from $PWD), so `go run` fails with
        # "directory ... outside main module or its selected dependencies".
        #
        # Shadow those wrappers with ones that cd to the module root and use a
        # RELATIVE package path, which Go resolves relative to the cwd and thus
        # accepts regardless of how the checkout is symlinked.
        develWrappers = pkgs.symlinkJoin {
          name = "authelia-dev-wrappers";
          paths = map (
            name:
            pkgs.writeShellScriptBin name ''
              root="$(${pkgs.git}/bin/git rev-parse --show-toplevel 2>/dev/null || true)"
              [ -n "$root" ] && cd "$root"
              exec ${go}/bin/go run "./cmd/${name}" "$@"
            ''
          ) [
            "authelia"
            "authelia-gen"
            "authelia-scripts"
            "authelia-suites"
          ];
        };
      in
      {
        devShells.default = pkgs.mkShell {
          name = "authelia";

          packages = [
            # Backend
            go
            pkgs.gopls
            pkgs.golangci-lint

            # Frontend
            nodejs
            pkgs.corepack

            # Tooling used by authelia-scripts / suites
            pkgs.git
            pkgs.gnumake

            # Linters required by the lefthook pre-commit `check tools` job
            # (golangci-lint and pnpm are already provided above).
            pkgs.goimports-reviser
            pkgs.shellcheck
            pkgs.trufflehog
            pkgs.typos
            pkgs.yamllint
            pkgs.zizmor

            # Symlink-safe authelia / authelia-scripts / authelia-gen /
            # authelia-suites wrappers (see develWrappers above). These
            # shadow the repo's cmd/dev/* scripts, so cmd/dev is intentionally
            # left off the PATH prepend below.
            develWrappers
          ];

          shellHook = ''
            # `authelia-scripts bootstrap` requires GOPATH to be set explicitly
            # (nix leaves it unset and relies on Go's $HOME/go default). Export
            # it so bootstrap passes and its ''${GOPATH}/bin PATH entry resolves.
            export GOPATH="''${GOPATH:-$HOME/go}"

            # Put web/node_modules/.bin on PATH, mirroring bootstrap.sh.
            # cmd/dev is deliberately omitted; develWrappers supersedes it.
            export PATH="$PWD/.buildkite/steps:$PWD/web/node_modules/.bin:$GOPATH/bin:$PATH"
            export DOCKER_BUILDKIT=1

            echo "Authelia dev shell"
            echo "  go:   $(go version | cut -d' ' -f3)"
            echo "  node: $(node --version)"
            echo ""
            echo "Frontend: cd web && corepack enable pnpm && pnpm install && pnpm start"
            echo "Full stack: source bootstrap.sh && authelia-scripts suites setup Standalone"

            source bootstrap.sh

            # Alpine reserves GID 100 (`users`, whose `guest` member can't be
            # removed) — and that is exactly this host's primary GID. The suite
            # Dockerfiles delete-then-recreate a `dev` group at ''${GROUP_ID},
            # which fails at GID 100 ("gid '100' in use"). bootstrap.sh sets
            # GROUP_ID from `id -g` (=100), so override it afterwards with a GID
            # that is free inside Alpine (mirroring the usual gid==uid layout).
            # USER_ID is unchanged, so files the containers write to the
            # bind-mounted /app and /go stay owned by the host user.
            export GROUP_ID="''${USER_ID:-$(id -u)}"
          '';
        };
      }
    );
}
