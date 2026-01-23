declare module 'swisseph' {
  export function swe_set_ephe_path(path: string): void;
  export function swe_set_sid_mode(mode: number, t0: number, ayan_t0: number): void;
  export function swe_julday(year: number, month: number, day: number, hour: number, gregflag: number): number;
  
  export interface CalcResult {
    flag: number;
    data: number[];
    error?: string;
  }
  
  export function swe_calc_ut(tjd_ut: number, ipl: number, iflag: number): CalcResult;
  
  export const SE_GREG_CAL: number;
  export const SE_SUN: number;
  export const SE_MOON: number;
  export const SE_MERCURY: number;
  export const SE_VENUS: number;
  export const SE_MARS: number;
  export const SE_JUPITER: number;
  export const SE_SATURN: number;
  export const SE_TRUE_NODE: number;
  export const SE_MEAN_NODE: number;
  export const SEFLG_SIDEREAL: number;
  export const SEFLG_SPEED: number;
  export const SE_SIDM_LAHIRI: number;
  
  export const version: string;
}
