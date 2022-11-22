const Joi = require('@hapi/joi');

//Validation Registration req.body
module.exports.registerValidation = (body) =>{
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    surname: Joi.string().required(),
    email: Joi.string().min(6).required().email(),
    phone: Joi.number().required(),
    city: Joi.string().required(),
    role: Joi.number().required(),
  })
  return schema.validate(body)
};

//Validation Login req.body
module.exports.loginValidation = (body) =>{
  const schema = Joi.object({
    dni: Joi.string().min(7).max(8).required(),
    password: Joi.string().min(5).required()
  })
  return schema.validate(body)
};

//Validation add a new donation
module.exports.newDonValidation = (body) =>{
  const schema = Joi.object({
    bossID: Joi.number().required(),
    date: Joi.date().iso().required(),
    value: Joi.number().positive().required(),
    payment: Joi.string().required(),
    placeID: Joi.number().required(),
    placeNameOther: Joi.string()
  })
  return schema.validate(body)
};

//Validation delete a donation
module.exports.deleteDonValidation = (body) =>{
  const schema = Joi.object({
    donID: Joi.number().required()
  })
  return schema.validate(body)
};

//Validation get donation history
module.exports.getDonValidation = (body) =>{
  const schema = Joi.object({
    startDate: Joi.date().iso().required()
  })
  return schema.validate(body)
};


//Validation add a new workplace
module.exports.newPlaceValidation = (body) =>{
  const schema = Joi.object({
    place: Joi.string().required(),
    reference: Joi.string().required(),
    city: Joi.string().required(),
    geolocation: Joi.string().required()
  })
  return schema.validate(body)
};





//Validation add new team
module.exports.newTeamValidation = (body) =>{
  const schema = Joi.object({
    name: Joi.string().required(),
    date: Joi.date().iso().required(),
    workplaces: Joi.array().min(1).required(),
    members: Joi.array().min(1).required(),
    worktime: Joi.object({
      start: Joi.required(),
      end: Joi.required()
    })
  })
  return schema.validate(body)
};

//Validation delete a team
module.exports.deleteTeamValidation = (body) =>{
  const schema = Joi.object({
    teamID: Joi.number().required()
  })
  return schema.validate(body)
};

//Validation get all teams
module.exports.getTeamValidation = (body) =>{
  const schema = Joi.object({
    date: Joi.date().iso().required()
  })
  return schema.validate(body)
};


//Validation add new user
module.exports.newPersonValidation = (body) =>{
  const schema = Joi.object({
    userName: Joi.string().required(),  
    userSurname: Joi.string().required(),
    email: Joi.string().required().email(),
    phone: Joi.string().required(), 
    dni: Joi.string().min(7).max(8).required(), 
    role: Joi.number().required(),
    city: Joi.string().required()
  })
  return schema.validate(body)
};


//Validation edit a user
module.exports.editPersonValidation = (body) =>{
  const schema = Joi.object({
    userID: Joi.number().required(),
    userName: Joi.string().required(),  
    userSurname: Joi.string().required(),
    email: Joi.string().required().email(),
    phone: Joi.string().required(),  
    role: Joi.number().required(),
    city: Joi.string().required()
  })
  return schema.validate(body)
};


//Validation set new status to timline
module.exports.setStatusValidation = (body) =>{
  const schema = Joi.object({
    status: Joi.number().required(),
    message: Joi.string(),
    geolocation: Joi.string().required()
  })
  return schema.validate(body)
};


//Validation update user's bosses
module.exports.updateBossesValidation = (body) =>{
  const schema = Joi.object({
    userID: Joi.number().required(),
    bosses: Joi.array().items(Joi.number()),
    facers: Joi.array().items(Joi.number())
  })
  return schema.validate(body)
};


//Validation update user's personal info
module.exports.updatePersonValidation = (body) =>{
  const schema = Joi.object({
    userName: Joi.string().required(),  
    userSurname: Joi.string().required(),
    email: Joi.string().required().email(),
    phone: Joi.string().required(),
    city: Joi.string().required()
  })
  return schema.validate(body)
};

//Validation update user's password
module.exports.updatePasswordValidation = (body) =>{
  const schema = Joi.object({
    password: Joi.string().required()
  })
  return schema.validate(body)
};