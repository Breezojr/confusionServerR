const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

var authenticate = require('../authenticate');
const cors = require('./cors');

const User = require('../models/user');
const Dishes = require('../models/dishes');
const Favorites = require('../models/favorites');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());


favoriteRouter.route('/')
	.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200)})
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({"user": req.user._id})
            .populate('user')
            .populate('dishes')
            .then((favorite) => {
                if(favorite == null) {                    
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end("You have no favorites");                     
                }
                else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }
            })
            .catch((err) => next(err));
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        let newFavorites; 
        
        Dishes.find({'_id': {$in: req.body} })
            .populate('user')
            .populate('dishes')
            .then((dishes) => {
                newFavorites = dishes;
            })
        Favorites.findOne({"user": req.user._id})            
            .then( (favoriteList) => {
                if(favoriteList == null) {
                    Favorites.create({'user': req.user, 'dishes': newFavorites})
                        .then((favorite) => {
                            res.statusCode = 201;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                }
                else {                    
                    favoriteList.dishes = favoriteList.dishes.concat(newFavorites)
                    favoriteList.save()
                        .then( (favorite) => {
                            Favorites.findById(favorites._id)
                            .populate('user')
                            .populate('dishes')
                            .then((favorite) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })                            
                        })
                        .catch((err) => next(err));
                }
            })
            .catch((err) => next(err));
    })

    .put((req, res, next) => {
        res.statusCode = 405; 
        res.end('PUT operation don\'t supported here');
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({"user": req.user._id})            
            .then( (favorite) => {
                if(favorite == null) {                    
                    res.statusCode = 418;
                    res.setHeader('Content-Type', 'application/json');
                    res.end("You have no favorites");                     
                }
                else {                    
                    favorite.remove()
                        .then( (resp) => {                            
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(resp);                                                          
                        })
                }
            })
            .catch((err) => next(err));

    });



favoriteRouter.route('/:dishId')
	.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200)})
    .get(cors.cors, (req, res, next) => {
        Favorites.findOne({user: req.user._id})
        .then((favorites) => {
            if (!favorites) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({"exists": false, "favorites": favorites});
                }
                else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({"exists": true, "favorites": favorites});
                }
            }

        }, (err) => next(err))
        .catch((err) => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({"user": req.user._id})
            .then( (favoriteList) => {
                if(favoriteList == null) {
                    Favorites.create({'user': req.user, 'dishes': req.params.dishId})
                        .then((favorite) => {
                            res.statusCode = 201;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                }
                else {
                    favoriteList.dishes.push(req.params.dishId);
                    favoriteList.save()
                        .then( (favorite) => {
                            Favorites.findById(favorites._id)
                            .populate('user')
                            .populate('dishes')
                            .then((favorite) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })                            
                        })
                        .catch((err) => next(err));
                }
            })
            .catch((err) => next(err));
    })

    .put((req, res, next) => {
        res.statusCode = 405; 
        res.end('PUT operation don\'t supported here');
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({"user": req.user._id})
            .then( (favoriteList) => {
                if(favoriteList == null) {                   
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    res.end("You have no any favorites");                      
                }
                else {
                    console.log(favoriteList.dishes);
                    favoriteList.dishes = favoriteList.dishes.filter(dishId => 
                        dishId != req.params.dishId
                    );
                    console.log(favoriteList.dishes);
                    favoriteList.save()
                        .then( (favorites) => {
                            res.json(favorites);
                        })                    
                }
            }).catch((err) => next(err));
    });


module.exports = favoriteRouter;