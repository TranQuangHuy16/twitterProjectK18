import express, { Request, Response, NextFunction } from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    res.status(400).json({ errors: errors.mapped() })
  }
}

// -----------trước khi sửa----------------
// import express from 'express';
// import { body, validationResult, ValidationChain } from 'express-validator';
// // can be reused by many routes

// // sequential processing, stops running validations chain if the previous one fails.
// const validate = (validations: ValidationChain[]) => {
//   return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
//     for (let validation of validations) {
//       const result = await validation.run(req);
//       if (result.errors.length) break;
//     }

//     const errors = validationResult(req);
//     if (errors.isEmpty()) {
//       return next();
//     }

//     res.status(400).json({ errors: errors.array() });
//   };
// };

// app.post('/signup', validate([
//   body('email').isEmail(),
//   body('password').isLength({ min: 6 })
// ]), async (req, res, next) => {
//   // request is guaranteed to not have any validation errors.
//   const user = await User.create({ ... });
// });
