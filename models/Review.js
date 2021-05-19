const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const reviewSchema = new mongoose.Schema({

    created:{
        type: Date,
        default: Date.now
    },
    author:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'An author please!'
    },
    store:{
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: 'An address please!'
    },
    text: {
        type:String,
        required: 'A comment please!'
    },
    rating: {
        type: Number,
        min:1,
        max:5
    }
});

// Jointure Permet de retrouver le nom et pas un nombre
function autopopulate(next){
    this.populate('author');
    next();
}
reviewSchema.pre('find', autopopulate);
reviewSchema.pre('findOne', autopopulate);


module.exports = mongoose.model('Review', reviewSchema);