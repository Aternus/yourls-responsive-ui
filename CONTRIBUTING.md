# Development of `yourls-responsive-ui`

## Project Requirements

- Docker: development environment (Apache, MySQL, PHP)
- mkcert: generating HTTPS certificates for local development
- PhpStorm: IDE

## Development Environment

### Local HTTPS Setup

1. Install [mkcert](https://github.com/FiloSottile/mkcert)
2. Change into the ssl directory: `cd {projectRoot}/.dev/ssl`
3. Using `mkcert`, generate a certificate and a key: `mkcert localhost "*.localhost"`
4. Rename certificate: `mv localhost+1.pem localhost.crt`
5. Rename key: `mv localhost+1-key.pem localhost.key`

### Using Docker

This repository includes a Docker setup for local development.

To build and run the environment:

```bash
docker compose up --build
```

Ensure that all necessary configuration files are in place (e.g., `php.ini`,
`.dev/ssl/localhost.crt`).

## Useful Commands

### Connect to a running container's shell

```shell
docker exec -it yourls-responsive-ui-web-1 bash
```

## Accessing the Admin Panel

- URL: `https://localhost/admin`
- Username: `root`
- Password: `root`
