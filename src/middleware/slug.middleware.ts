import {
  Document,
  Model,
  Schema,
  CallbackWithoutResultAndOptionalError,
} from "mongoose";
import slugify from "slugify";

export interface ISlugDocument extends Document {
  title: string;
  slug: string;
}

export async function generateUniqueSlug<I extends ISlugDocument>(
  model: Model<I>,
  title: string,
  existingSlug?: string
): Promise<string> {
  if (!title || typeof title !== "string") {
    throw new Error("Title must be a non-empty string");
  }

  let slug = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

  if (existingSlug === slug) {
    return slug;
  }

  try {
    let existingDoc = await model.findOne({ slug });
    let counter = 1;
    const baseSlug = slug;

    while (existingDoc) {
      slug = `${baseSlug}-${counter}`;
      existingDoc = await model.findOne({ slug });
      counter++;
    }
    return slug;
  } catch (error) {
    throw new Error(`Failed to generate slug: ${(error as Error).message}`);
  }
}

export function attachSlugMiddleware<T extends ISlugDocument>(
  schema: Schema<T>,
  field: string = "title"
): void {
  schema.pre<T>(
    "save",
    async function (next: CallbackWithoutResultAndOptionalError) {
      const fieldValue = (this as any)[field] as string;
      if (!fieldValue) {
        return next(new Error(`${field} is required for slug generation`));
      }

      if (this.isNew || this.isModified(field)) {
        this.slug = await generateUniqueSlug<T>(
          this.constructor as Model<T>,
          fieldValue,
          this.slug
        );
      }
      next();
    }
  );
}
