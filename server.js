import express from 'express';
import path from 'path';
import { match, RouterContext } from 'react-router';
import { renderToString } from 'react-dom/server';
import logger from 'morgan';
import bodyParser from 'body-parser';
import React from 'react';
import routes from './app/routes';

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// send all requests to index.html so browserHistory works
app.get('*', (req, res) => {
  match({ routes, location: req.url }, (err, redirect, props) => {
	if (err) {
	  res.status(500).send(err.message)
	} else if (redirect) {
	  res.redirect(redirect.pathname + redirect.search)
	} else if (props) {
	  // hey we made it!
	  const appHtml = renderToString(<RouterContext {...props}/>)
	  res.send(renderPage(appHtml))
	} else {
	  res.status(404).send('Not Found')
	}
  })
})

function renderPage(appHtml) {
  return `
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="utf-8"/>
		<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
		<meta name="viewport" content="width=device-width, initial-scale=1"/>
		<title>demo</title>
		<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700,900"/>
		<link rel="stylesheet" href="/css/main.css"/>
	</head>
	<body>
	<div id="app">${appHtml}</div>
	<script src="/js/vendor.js"></script>
	<script src="/js/vendor.bundle.js"></script>
	<script src="/js/bundle.js"></script>
	</body>
	</html>
   `
}

app.use(function(req, res) {
  Router.run(routes, req.path, function(Handler) {
    var html = React.renderToString(React.createElement(Handler));
    var page = swig.renderFile('views/index.html', { html: html });
    res.send(page);
  });
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});