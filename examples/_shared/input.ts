import { z } from "zod";

export const activityFilterSchema = z.enum(["active", "all", "completed"]);

export function parseSelectedOption<Option extends string>(
  value: string,
  options: readonly Option[]
): Option {
  const selectedOption = options.find((option) => option === value);

  if (selectedOption === undefined) {
    throw new Error("Select an available option.");
  }

  return selectedOption;
}
