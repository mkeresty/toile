"use client";import * as React from "react";import {clsx} from "clsx";
export function Scene({children,className,world="mediterranean"}:{children:React.ReactNode;className?:string;world?:string}){return <section className={clsx("toile-scene",className)} data-world={world}>{children}</section>}
export function SceneLayer({children,depth=0,className}:{children:React.ReactNode;depth?:number;className?:string}){return <div className={clsx("toile-scene-layer",className)} style={{"--scene-depth":depth} as React.CSSProperties}>{children}</div>}
export function SceneAnchor({children,name}:{children:React.ReactNode;name:string}){return <div className="toile-scene-anchor" data-anchor={name}>{children}</div>}
