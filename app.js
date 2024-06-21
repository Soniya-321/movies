const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//Get Movie Names API
app.get('/movies/', async (request, response) => {
  const getMovieNamesQuery = `
        SELECT movie_name 
        FROM movie
        ORDER BY movie_id;
    `
  const movieNamesArray = await db.all(getMovieNamesQuery)
  response.send(
    movieNamesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

//Create Movie API
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const createmovieQuery = `
    INSERT INTO movie 
    (director_id, movie_name, lead_actor)
    VALUES 
    (
      ${directorId},
      '${movieName}',
      '${leadActor}'
    );
  `
  await db.run(createmovieQuery)
  response.send('Movie Successfully Added')
})

//Get Movie API
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
    SELECT * 
    FROM movie 
    WHERE movie_id = ${movieId};
  `
  const movie = await db.all(getMovieQuery)
  response.send(
    ...movie.map(eachMovie => ({
      movieId: eachMovie.movie_id,
      directorId: eachMovie.director_id,
      movieName: eachMovie.movie_name,
      leadActor: eachMovie.lead_actor,
    })),
  )
})

//Update Movie API
app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateMovieQuery = `
    UPDATE movie 
    SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};
  `
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//Delete Movie API
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
    DELETE FROM movie 
    WHERE movie_id = ${movieId};
  `
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//Get Directors API
app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
    SELECT * 
    FROM director 
    ORDER BY director_id;
  `
  const directorsArray = await db.all(getDirectorsQuery)
  response.send(
    directorsArray.map(eachDirector => ({
      directorId: eachDirector.director_id,
      directorName: eachDirector.director_name,
    })),
  )
})

//Get Movie Name With Directors
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMoviesQuery = `
    SELECT * 
    FROM movie  
    WHERE director_id = ${directorId};
  `
  const movieDirectorArray = await db.all(getDirectorMoviesQuery)
  response.send(movieDirectorArray.map(each => ({movieName: each.movie_name})))
})

module.exports = app
