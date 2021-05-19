const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
    name: {
        type:String,
        trim: true,
        required: 'Please enter a name'
    },
    slug: String,
    description:{
        type:String,
        trim: true,        
    },
    tags:[String],
    
    categories:{
        type:String,
        trim: true,
    },
    private:{
        type: String,
        default: 'non'
    },     
    created:{
        type: Date,
        default: Date.now
    },
    location:{
        type:{
            type:String,
            default: 'Point'
        },
        coordinates: [{
                type: Number,
                required: 'Coordinates !'
            }],
        address:{
            type: String,
            required: 'An address, please!'
        }
    },
    photo: String,
    //image:[{path:String, filename:String }], // new cloudinary
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'An author, please !'
    }
}, { // associe le virtual
    toJSON: { virtuals:true },
    toObject: { virtuals: true },
});

// JOIN Store and Reviews, ->Virtual liaison
// stores._id === reviews.store -> join
storeSchema.virtual('reviews', {
    ref:'Review', // Model
    localField: '_id', // from Store
    foreignField: 'store' // from Review
});

// slug name automatique
storeSchema.pre('save', async function(next){
    if(!this.isModified('name')){
        next();
        return;
    }
    this.slug = slug(this.name);
    // search all same as slug-1, slug-2
    // todo unique slug, and search all same and create an another one as slug-1, slug-2
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
   
    const storeWithSlug = await this.constructor.find({slug: slugRegEx});
    if(storeWithSlug.length){
        this.slug = `${this.slug}-${storeWithSlug.length + 1}`;
    }
    next();
});

// Tags requete
storeSchema.statics.getTagsList = function(){
    return this.aggregate([
       { $unwind: '$tags'},
       { $group:{ _id: '$tags', countDocuments :{$sum:1} } },
       { $sort: {countDocuments : -1} }
    ]);
}

// Catgeories requete countDocuments count
storeSchema.statics.getCatsList = function(){
    return this.aggregate([
       { $unwind: '$categories'},
       { $group:{ _id: '$categories', countDocuments :{$sum:1} } },
       { $sort: {countDocuments : -1} }

    ]);
};

// Top page avec 
// Store parametres et Review parametres
storeSchema.statics.getTopStores = function(){
    return this.aggregate([
        // Lookup Stores and populate their reviews
        { $lookup: {
            from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews'}
        },
        //Filter only with 2 or more review
        { $match: { 
            'reviews.1': { $exists: true } } 
        },
        // Add AVG() project ajoute un field
        // $addField OR $project
        { $project: {
            photo: '$$ROOT.photo',
            name: '$$ROOT.name',
            reviews: '$$ROOT.reviews',
            slug: '$$ROOT.slug',
            averageRating: { $avg: '$reviews.rating'}
        }},
        // sort Highest
        {
            $sort: { averageRating: -1}
        },
        //Limit
        {
            $limit:10
        }
    ])
}




// Define index for LOCATION
storeSchema.index({ location: '2dsphere' });

//Define index for SEARCH
storeSchema.index({
    name: 'text',
    description:'text'
});


// Populate
function autopopulate(next){
    this.populate('reviews');
    next();
}
storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);



module.exports = mongoose.model('Store', storeSchema);

// categories:[{type: Schema.Types.ObjectId, ref: 'Categories'}]