import { Request, Response, NextFunction } from 'express';
import { HTTPException } from '../util/http-exception';

const post = { id: 'md1', title: 'awesome', description: 'miles davis' };

export async function postPost(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const obj = req.body;
    if (!obj.title) {
      next(HTTPException.malformedErr('title is missing from body'));
    } else if (!obj.description) {
      next(HTTPException.malformedErr('description is missing from body'));
    } else {
      res.status(201).json(obj);
    }
  } catch (err) {
    next(HTTPException.internalErr(err));
  }
}

export async function getPost(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;
    if (id !== 'md1') {
      next(HTTPException.notFoundErr('id does not exist'));
    } else {
      res.status(200).json(post);
    }
  } catch (err) {
    next(HTTPException.internalErr(err));
  }
}

export async function patchPost(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id;
    const obj = req.body;
    if (id !== 'md1') {
      next(HTTPException.notFoundErr('id does not exist'));
    } else if (!obj.title && !obj.description) {
      next(
        HTTPException.malformedErr(
          'please provide at least one property to update'
        )
      );
    } else {
      res.status(200).json(obj);
    }
  } catch (err) {
    next(HTTPException.internalErr(err));
  }
}

export async function putPost(req: Request, res: Response, next: NextFunction) {
  try {
    const obj = req.body;
    if (!obj.title) {
      next(HTTPException.malformedErr('title is missing from body'));
    } else if (!obj.description) {
      next(HTTPException.malformedErr('description is missing from body'));
    } else {
      res.status(201).json(obj);
    }
  } catch (err) {
    next(HTTPException.internalErr(err));
  }
}

export async function deletePost(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id;
    if (id !== 'md1') {
      next(HTTPException.notFoundErr('id does not exist'));
    } else {
      res.status(200).json(post);
    }
  } catch (err) {
    next(HTTPException.internalErr(err));
  }
}
