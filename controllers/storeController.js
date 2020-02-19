const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User'); // pour Heart
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions={
    storage: multer.memoryStorage(),
    fileFilter(req,file,next){
        const isPhoto = file.mimetype.startsWith('image/');
        if(isPhoto){
            next(null,true);
        }else{
            next({message: 'Type d\'image impossible' }, false);
        }
    }
};

// Home Page
exports.homePage = (req,res) =>{
    res.render('index');
};
//
exports.aboutPage = (req,res) =>{
    res.render('about', {title: 'About My addreses'});
};

// Admin 

// user id  =  author
// stores dont le author = user_ ID
exports.getAdminStores = async (req,res) => {
    const stores = await Store.find()
    .populate('author'); // get data
    //res.json(stores);   
    res.render('admin', { title: 'Admin', stores }); // render data
};

// Add Page
exports.addStore = (req,res) =>{
    res.render('editStore', { title: 'Ajouter votre adresse'});
};


// Upload Image
exports.upload = multer(multerOptions).single('photo');
exports.resize = async (req,res,next) => {
    if(!req.file) { 
        next();
        return; 
    }
    //console.log(req.file);
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
    next();
}


// Create with catchErrors(fn)
exports.createStore = async (req,res) =>{
    req.body.author = req.user._id;
    const store = await (new Store(req.body)).save(); // creation instantanée
    req.flash('success', `Successfully created ${store.name}.`)
    //console.log('OK saved');
    res.redirect(`/store/${store.slug}`);
    //res.json(req.body);
};


// Retrouver toutes les addreses
exports.getStores = async (req,res) => {
    const page = req.params.page || 1;
    const limit= 4;
    const skip= (page *limit) - limit;
    const storesPromise = Store
    .find()
    .populate('author')
    .skip(skip)
    .limit(limit)
    .sort({ created: 'desc' })
    ; // get data
    // count nb stores in DB
    const countPromise = Store.count();
    const[ stores, count ] = await Promise.all([storesPromise,countPromise]);

    const pages = Math.ceil(count / limit); // over count with ceil
    if(!stores.length && skip){
        req.flash('info', `Hey, vous cherchez la page ${page} mais elle n'existe pas. La dernière page est la page ${pages}.`);
        res.redirect(`/stores/page/${pages}`);
        return;
    }
    res.render('stores', { title: 'Toutes les adresses', stores, count, pages, page }); // render data
};

// Middleware pour controler le createur d'une adresse
const confirmOwner = (store, user) => {
    if(!store.author.equals(user._id)){
        throw Error('Oops, vous ne pouvez éditer que vos adresses!');
    }
};


// Addresses  edit
exports.editStore = async (req,res) => {
    // find id
    const store = await Store.findOne({ _id: req.params.id });
    //res.json(store);
    // confirm user
    confirmOwner(store, req.user);
    res.render('editStore', { title: `Editez votre ${store.name}`, store});
};

// Update Addresses  page
exports.updateStore = async (req,res) => {
    // set loc
    req.body.location.type = 'Point';
    // find and update id
    const store = await Store.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        {
            new: true,
            runValidators: true
        }).exec();
    req.flash('success', `Successfully Updated your ${store.name}. <a href="/store/${store.slug}">Visualiez l'adresse…</a> `);
    res.redirect(`/stores/${store._id}/edit`);
};

// Delete Address


// GET Store by Slug(titre) 
// ajout de author(User) et de reviews (Review)
exports.getStoreBySlug = async (req,res, next) => {
    const store = await Store
        .findOne({ slug: req.params.slug})
            .populate('author reviews'); // by author
    if(!store) return next();
    res.render('store', { title: store.name, store }); // render data
};


// GET Tags page
exports.getStoresByTag = async (req,res) => {
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true }; //
    const tagsPromise = Store.getTagsList();
    const storesPromise = Store.find({ tags: tagQuery });
    const [tags,stores] = await Promise.all([tagsPromise,storesPromise]);
//res.json(result); destructure
    //var tags = result[0]; var stores = result[1];
    res.render('tags', { tags: tags , title: 'Tags', tag, stores}) ;
};

// GET Categories page
exports.getStoresByCat = async (req,res) => {
    const categorie = req.params.categorie;
    const categorieQuery = categorie || {$exists:true};
    const categoriesPromise = Store.getCatsList();
    const storesPromise = Store.find({ categories: categorieQuery });
    const [categories, stores] = await Promise.all([categoriesPromise,storesPromise]);
    res.render('categories', { categories , title: 'Categories', categorie, stores}) ;
};


// SEARCH 
// http://localhost:7777/api/search?q=beer&name=wes
// mongoose parametres
exports.searchStores = async (req,res) => {
    const stores = await Store
        .find({
            $text:{ $search: req.query.q }
            },{
            score:{ $meta: 'textScore' }
            })
        .sort({
            score:{ $meta: 'textScore' }
        })
        .limit(5);
    res.json(stores);
}


// MAP Location lat lng
exports.mapStores = async (req,res) => {
    //res.json( {it: 'Work'});
    const coordinates = [req.query.lng, req.query.lat].map(parseFloat);

    const q = {
        location: {
            $near: {
                $geometry: {
                    type:'Point',
                    coordinates: coordinates
                },
                $maxDistance: 10000 // 10km
            }
        }
    }
    const stores = await Store
        .find(q)
        .select('slug name description photo location');
    res.json(stores);
}

// Map page
exports.mapPage= (req,res) => {
    res.render('map', { title: 'Map'});
}


// Heart toggle methode '$pull' : '$addToSet'
exports.heartStore = async(req,res) => {
    const hearts = req.user.hearts.map(obj => obj.toString());
    const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
    const user  = await User
        .findByIdAndUpdate(req.user._id,
            { [operator]: { hearts: req.params.id}},
            { new: true} 
            )
    //console.log(hearts);
    res.json(user);
};

// Page Hearts retrouve toutes les stores avec un coeur de l'utilisateur
exports.getHearts = async (req,res) => {
    const stores = await Store.find({
        _id: { $in: req.user.hearts}
    });

    //res.json(stores);
    res.render('stores', { title: 'Hearted Stores', stores})

};


// Top
// Creation d'une aggregation dans le Model
exports.getTopStores = async (req,res) => {
const stores = await Store.getTopStores();
//res.json(stores)
res.render('topStores', { title: 'Top', stores });
}