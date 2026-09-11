import * as React from "react";import {clsx} from "clsx";
export type ButtonProps=React.ButtonHTMLAttributes<HTMLButtonElement>&{variant?:"ink"|"paper"|"quiet"};
export const Button=React.forwardRef<HTMLButtonElement,ButtonProps>(({className,variant="ink",...props},ref)=><button ref={ref} className={clsx("toile-button",`toile-button--${variant}`,className)} {...props}/>);Button.displayName="Button";
