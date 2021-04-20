const path = require("path");
const errorHandler = require(path.resolve("src/errors/errorHandler"));
const notFound = require(path.resolve("src/errors/notFound"));
const helpers = require(path.resolve("src/utils/helpers"));

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
const orderExists = (req, res, next) => {
  const { orderId } = req.params;
  const foundOrder = orders.find(order => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  } else {
    return notFound(req, res, next);
  }
}

const deliverToProvided = (req, res, next) => {
  const { data: { deliverTo } = {} } = req.body;
  if (helpers.isProvided(deliverTo)) {
    next();
  } else {
    errorHandler({
      status: 400,
      message: "Order must include a deliverTo"
    }, req, res, next);
  }
}

const mobileNumberProvided = (req, res, next) => {
  const { data: { mobileNumber } = {} } = req.body;
  if (helpers.isProvided(mobileNumber)) {
    next();
  } else {
    errorHandler({
      status: 400,
      message: "Order must include a mobileNumber"
    }, req, res, next);
  }
}

const dishProvided = (req, res, next) => {
  const { data: { dishes } = {} } = req.body;
  if (!helpers.isProvided(dishes)) {
    errorHandler({
      status: 400,
      message: "Order must include a dish"
    }, req, res, next);
  } 
  return next();
}

const dishArrayNotEmpty = (req, res, next) => {
  const { data: { dishes } = {} } = req.body;
  if (!Array.isArray(dishes) || helpers.arrayIsEmpty(dishes)) {
    errorHandler({
      status: 400,
      message: "Order must include at least one dish"
    }, req, res, next);
  }
  return next();
}

const checkForDishQuantity = (req, res, next) => {
  const { data: { dishes } = {} } = req.body;
  dishes.forEach((dish, index) => {
    if (!dish.quantity || !helpers.isPositiveInteger(dish.quantity)) {
      errorHandler({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`
      }, req, res, next);
    }
  });
  return next();
}

const checkStatus = (req, res, next) => {
  const { data: { status } = {} } = req.body;
  const allowedStatuses = ["pending", "preparing", "out-for-delivery", "delivered"];
  if (!helpers.isProvided(status) || !allowedStatuses.includes(status)) {
    errorHandler({
      status: 400,
      message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
    }, req, res, next);
  }
  if (status === "delivered") {
    errorHandler({
      status: 400,
      message: "A delivered order cannot be changed"
    }, req, res, next);
  }
  next();
}

const idsMatch = (req, res, next) => {
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;
  if (!id || orderId === id) {
    return next();
  } else {
    errorHandler({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
    }, req, res, next);
  }
}

const list = (req, res) => {
  res.json({ data: orders });
}

const read = (req, res) => {
  res.json({ data: res.locals.order });
}

const create = (req, res) => {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const id = nextId();
  const newOrder = {
    id,
    deliverTo,
    mobileNumber,
    status,
    dishes
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

const update = (req, res) => {
  const order = res.locals.order;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;
  res.locals.order = order;
  res.json({ data: order });
}

const destroy = (req, res, next) => {
  const order = res.locals.order;
  if (order.status !== "pending") {
    errorHandler({
      status: 400,
      message: "An order cannot be deleted unless it is pending"
    }, req, res, next);
  }
  const index = orders.findIndex((item) => item.id === order.id);
  orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  read: [orderExists, read],
  create: [
    deliverToProvided, 
    mobileNumberProvided, 
    dishProvided, 
    dishArrayNotEmpty,
    checkForDishQuantity,
    create],
  update: [
    orderExists,
    deliverToProvided,
    mobileNumberProvided,
    dishProvided,
    dishArrayNotEmpty,
    checkForDishQuantity,
    idsMatch,
    checkStatus,
    update
  ],
  delete: [orderExists, destroy],
}
// TODO: Implement the /orders handlers needed to make the tests pass
