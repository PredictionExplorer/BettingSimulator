import * as wasm from "./kelly_sim_bg.wasm";
import { __wbg_set_wasm } from "./kelly_sim_bg.js";
__wbg_set_wasm(wasm);
export * from "./kelly_sim_bg.js";
