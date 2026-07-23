module.exports = {
    development: {
        client: 'pg',
        connection: {
            database: 'tinder',
            user: 'Mothilal.Sivaram',
            password: ''
        },
        migrations: {
            directory: './db/migrations'
          },
          seeds: {
            directory: './db/seeds'
          }
    }
}