import bcrypt from 'bcrypt'
import { type User } from '../models/types'
import { type NextFunction, type Request, type Response } from 'express'
import { isValidEmail, isValidGender, isValidPassword, isValidUsername } from '../utils/validation-utils'
import { storeUser } from '../models/user/users'

export const validateSignUpCredentials = async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
  if (_req.body == null) {
    _res.status(400)
    _res.send('Malformed Request!')
    return
  }

  if (_req.body.username == null || _req.body.password == null || _req.body.email == null || _req.body.gender == null) {
    _res.status(400)
    _res.send('Required details missing!')
    return
  }

  if (isValidUsername(_req.body.username) &&
    isValidPassword(_req.body.password) &&
    isValidEmail(_req.body.email) &&
    isValidGender(_req.body.gender)
  ) {
    const saltRounds = await bcrypt.genSalt(10)
    const potentialUser: User = {
      username: _req.body.username,
      password: await bcrypt.hash(_req.body.password, saltRounds),
      email: _req.body.email,
      friends: [],
      gender: _req.body.gender
    }
    _res.locals.validatedPotentialUserDetails = potentialUser
    next()
    return
  }
  _res.status(401)
  _res.send('One or more details incorrect or missing!')
}

/**
 * Main handler for Signup. Stores user details to DB.
 * Assumes details are available in request body and have been validated.
 */
export const signup = async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await storeUser(_res.locals.validatedPotentialUserDetails)
    if (result != null && result.$response.httpResponse.statusCode === 200) {
      _res.redirect('/')
      return
    }
    console.error('User signup failed! Query response {}', result.$response)
    _res.sendStatus(500)
    return
  } catch (e) {
    console.error('User signup failed! Error: {}', e)
    _res.sendStatus(500)
  }
}
