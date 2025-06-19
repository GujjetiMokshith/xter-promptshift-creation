// Consolidated type declarations

// UI Component declarations
declare module '@/components/ui/button' {
  import { ButtonProps } from 'react';
  export const Button: React.ForwardRefExoticComponent<ButtonProps>;
  export const buttonVariants: any;
}

declare module '@/components/ui/input' {
  import { InputHTMLAttributes } from 'react';
  export const Input: React.ForwardRefExoticComponent<InputHTMLAttributes<HTMLInputElement>>;
}

declare module '@/components/ui/tooltip' {
  export const Tooltip: any;
  export const TooltipContent: any;
  export const TooltipProvider: any;
  export const TooltipTrigger: any;
}

// Service declarations
declare module '@/lib/grok-service' {
  export function analyzePrompt(prompt: string): Promise<any>;
  export function enhancePrompt(prompt: string, toneStyle?: "formal" | "casual" | "creative" | "technical"): Promise<any>;
  export function generatePrompts(topic: string, useCase?: string, maxResults?: number): Promise<any>;
}

// React declarations (if not using @types/react)
declare module 'react' {
  export type ReactNode = React.ReactNode;
  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }
  
  export interface JSXElementConstructor<P> {
    (props: P): ReactElement<any, any> | null;
  }
  
  export type Key = string | number;
  
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useRef<T>(initialValue: T): { current: T };
  export function createContext<T>(defaultValue: T): any;
  export function useContext<T>(context: any): T;
  
  export default React;
}

// Next.js declarations
declare module 'next/navigation' {
  export function useSearchParams(): URLSearchParams;
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    prefetch: (url: string) => void;
  };
}

declare module 'next/link' {
  import { ReactNode } from 'react';
  
  export interface LinkProps {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    className?: string;
    children?: ReactNode;
  }
  
  export default function Link(props: LinkProps): JSX.Element;
}

// JSX declarations
declare namespace JSX {
  interface IntrinsicElements {
    div: any;
    span: any;
    p: any;
    h1: any;
    h2: any;
    h3: any;
    input: any;
    button: any;
    a: any;
    svg: any;
    path: any;
    [elemName: string]: any;
  }
} 