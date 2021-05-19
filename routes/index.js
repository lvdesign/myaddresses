const express = require('express');
const router = express.Router();
const { catchErrors } = require('../handlers/errorHandlers');
//
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const reviewController = require('../controllers/reviewController');

// Image
require('dotenv').config({ path: 'variables.env' });  

console.log("*------cloud_name INDEX-------*");
console.log(process.env.CLOUDINARY_cloud_name);

const multer  = require('multer');
const cloudinary = require('cloudinary').v2


// Admin
router.get('/admin', 
    authController.isLoggedIn, 
    catchErrors( storeController.getAdminStores) );


// Home
router.get('/', catchErrors( storeController.getStores) );
router.get('/stores', catchErrors( storeController.getStores) );
// pagination -> :page
router.get('/stores/page/:page', catchErrors( storeController.getStores) );

// About
router.get('/about', catchErrors( storeController.aboutPage) );

// Add STORE
router.get('/add', 
    authController.isLoggedIn, 
    storeController.addStore
    );
// with images
router.post('/add', 
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.createStore) 
);

router.post('/add/:id', 
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.updateStore) );


router.get('/stores/:id/edit', catchErrors(storeController.editStore) );

// Store/detail
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug) );

// Tags
router.get('/tags', catchErrors(storeController.getStoresByTag) );
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag) );

// Categories
router.get('/categories', catchErrors(storeController.getStoresByCat) );
router.get('/categories/:categorie', catchErrors(storeController.getStoresByCat) );


// Reviews
router.post('/reviews/:id', 
authController.isLoggedIn,
catchErrors(reviewController.addReview) );


// User
router.get('/login', userController.loginForm );
router.post('/login', authController.login);

router.get('/register', userController.registerForm );
router.post('/register',    
    userController.validateRegister,
    userController.upload,
    catchErrors(userController.resize),
    catchErrors(userController.register),
    authController.login
);

router.get('/logout', authController.logout );


// ACCOUNT pages
// GET
router.get('/account', 
    authController.isLoggedIn,
    userController.account);

// POST
router.post('/account', 
userController.upload,
    catchErrors(userController.resize),
catchErrors(userController.updateAccount) );

router.post('/account/forgot',catchErrors(authController.forgot) );

// RESET
router.get('/account/reset/:token', catchErrors(authController.reset) );
router.post('/account/reset/:token', 
    authController.confirmedPassword,
    catchErrors(authController.update) 
);

// MAP page
router.get('/map', storeController.mapPage);




// HEART page get
router.get('/hearts', 
    authController.isLoggedIn, 
    catchErrors(storeController.getHearts) );

// TOP page
router.get('/top', catchErrors(storeController.getTopStores) );

/****************
API section
*/
// SEARCH
router.get('/api/search', catchErrors(storeController.searchStores) );
// MAP
router.get('/api/stores/near', catchErrors(storeController.mapStores) );
// HEART
router.post('/api/stores/:id/heart', catchErrors(storeController.heartStore)  );




module.exports = router;
