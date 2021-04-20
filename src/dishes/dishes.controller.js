const path = require("path");
const errorHandler = require(path.resolve("src/errors/errorHandler"));
const notFound = require(path.resolve("src/errors/notFound"));
const helpers = require(path.resolve("src/utils/helpers"));

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function dishExists(req, res, next){
  const {dishId} = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if(foundDish){
    res.locals.dish = foundDish;
    return next()
  }else{
    return notFound(req, res, next);
  };
};

const nameProvided = (req, res, next) => {
  const { data: { name } = {} } = req.body;
  if (helpers.isProvided(name)) {
    next();
  } else {
    errorHandler({
      status: 400,
      message: "Dish must include a name"
    }, req, res, next);
  }
}

const descriptionProvided = (req, res, next) => {
  const { data: { description } = {} } = req.body;
  if (helpers.isProvided(description)) {
    next();
  } else {
    errorHandler({
      status: 400,
      message: "Dish must include a description"
    }, req, res, next);
  }
}

const priceProvided = (req, res, next) => {
  const { data: { price } = {} } = req.body;
  if (helpers.isProvided(price)) {
    next();
  } else {
    errorHandler({
      status: 400,
      message: "Dish must include a price"
    }, req, res, next);
  }
}

const imageUrlProvided = (req, res, next) => {
  const { data: { image_url } = {} } = req.body;
  if (helpers.isProvided(image_url)) {
    next();
  } else {
    errorHandler({
      status: 400,
      message: "Dish must include a image_url"
    }, req, res, next);
  }
}

const checkPrice = (req, res, next) => {
  const { data: { price } = {} } = req.body;
  if (helpers.isPositiveInteger(price)) {
    next();
  } else {
    errorHandler({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0"
    }, req, res, next);
  }
}

const idsMatch = (req, res, next) => {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;
  if (!id || dishId === id) {
    return next();
  } else {
    errorHandler({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
    }, req, res, next);
  }
}


function list(req, res){
  res.json({ data: dishes })
};

function create(req, res, next){
  const {data : { name, description, price, image_url } = {} } = req.body;
   const id = nextId();
  const newDish = {
    id,
    name,
    description,
    price,
    image_url
  };
  dishes.push(newDish)
  res.status(201).json({data:newDish})
};

function read (req, res){
  res.json({ data: res.locals.dish })
};

function update(req, res){
  const dish = res.locals.dish
  const {data : {name, description, price, image_url } = {} } =req.body;
  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;
  res.locals.dish = dish;
  res.json({data:dish})
};

module.exports = {
  list,
  read:[dishExists, read],
  create:[
    nameProvided,
    descriptionProvided, 
    priceProvided, 
    imageUrlProvided, 
    checkPrice, 
    create],
  update: [
    dishExists, 
    nameProvided,
    descriptionProvided,
    priceProvided,
    imageUrlProvided,
    checkPrice, 
    idsMatch, 
    update],
};


