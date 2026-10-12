"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { LabId } from "@/lib/types";

const loading = () => <div className="h-[460px] animate-pulse rounded-2xl bg-slate-900" />;

/** Chaque labo est chargé à la demande pour garder les pages légères. */
export const LAB_COMPONENTS: Record<LabId, ComponentType> = {
  traceur: dynamic(() => import("./FreePlotter"), { loading }),
  affine: dynamic(() => import("./AffineLab"), { loading }),
  vecteurs: dynamic(() => import("./VectorLab"), { loading }),
  "second-degre": dynamic(() => import("./QuadraticLab"), { loading }),
  tangente: dynamic(() => import("./TangentLab"), { loading }),
  trigo: dynamic(() => import("./TrigLab"), { loading }),
  suites: dynamic(() => import("./SequenceLab"), { loading }),
  "exp-ln": dynamic(() => import("./ExpLnLab"), { loading }),
  integrale: dynamic(() => import("./IntegralLab"), { loading }),
  binomiale: dynamic(() => import("./BinomialLab"), { loading }),
};
