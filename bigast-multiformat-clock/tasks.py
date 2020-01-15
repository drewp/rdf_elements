from invoke import task  # pytype: disable=import-error


@task
def setup_js(ctx):
    ctx.run('yarn install')

@task
def serve_demo(ctx):
    ctx.run('webfsd -Fp 8021')

@task
def build(ctx):
    ctx.run(f'yarn run build', pty=True)

@task
def build_forever(ctx):
    ctx.run(f'yarn run build_forever', pty=True)

@task
def test(ctx):
    ctx.run(f'yarn run test', pty=True)

@task
def test_forever(ctx):
    ctx.run(f'yarn run test_forever', pty=True)

