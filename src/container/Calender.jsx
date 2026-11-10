import { ChevronLeft, ChevronRight } from "lucide-react";
import { FiLoader } from "react-icons/fi";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/axios";
import { getApiErrorMessage } from "../utils/apiErrorHandler";
import ApiErrorModal from "./ApiErrorModal";
import { getAccessToken, getUserRole } from "../services/authSession";

const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

/*  Holiday images
  To use a real photo later, replace a value with a path like "/holidays/ganesh.jpg" */
const HOLIDAY_IMAGES = {
  flag: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%220%22 y2=%221%22%3E%3Cstop offset=%220%22 stop-color=%22%234aa3e8%22/%3E%3Cstop offset=%221%22 stop-color=%22%23d6efff%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22200%22 height=%22200%22 fill=%22url%28%23g%29%22/%3E%3Crect x=%2234%22 y=%2240%22 width=%224%22 height=%22150%22 rx=%222%22 fill=%22%236b4f2a%22/%3E%3Cpath d=%22M40.0,46.0 L50.0,48.8 L60.0,50.0 L70.0,48.8 L80.0,46.0 L90.0,43.2 L100.0,42.0 L110.0,43.2 L120.0,46.0 L130.0,48.8 L140.0,50.0 L150.0,48.8 L160.0,46.0 L160.0,72.0 L150.0,74.8 L140.0,76.0 L130.0,74.8 L120.0,72.0 L110.0,69.2 L100.0,68.0 L90.0,69.2 L80.0,72.0 L70.0,74.8 L60.0,76.0 L50.0,74.8 L40.0,72.0Z%22 fill=%22%23FF9933%22/%3E%3Cpath d=%22M40.0,72.0 L50.0,74.8 L60.0,76.0 L70.0,74.8 L80.0,72.0 L90.0,69.2 L100.0,68.0 L110.0,69.2 L120.0,72.0 L130.0,74.8 L140.0,76.0 L150.0,74.8 L160.0,72.0 L160.0,98.0 L150.0,100.8 L140.0,102.0 L130.0,100.8 L120.0,98.0 L110.0,95.2 L100.0,94.0 L90.0,95.2 L80.0,98.0 L70.0,100.8 L60.0,102.0 L50.0,100.8 L40.0,98.0Z%22 fill=%22%23fff%22/%3E%3Cpath d=%22M40.0,98.0 L50.0,100.8 L60.0,102.0 L70.0,100.8 L80.0,98.0 L90.0,95.2 L100.0,94.0 L110.0,95.2 L120.0,98.0 L130.0,100.8 L140.0,102.0 L150.0,100.8 L160.0,98.0 L160.0,124.0 L150.0,126.8 L140.0,128.0 L130.0,126.8 L120.0,124.0 L110.0,121.2 L100.0,120.0 L90.0,121.2 L80.0,124.0 L70.0,126.8 L60.0,128.0 L50.0,126.8 L40.0,124.0Z%22 fill=%22%23138808%22/%3E%3Ccircle cx=%22100%22 cy=%2285%22 r=%229%22 fill=%22none%22 stroke=%22%231a3a8f%22 stroke-width=%221.2%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%22109.0%22 y2=%2285.0%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%22108.7%22 y2=%2287.3%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%22107.8%22 y2=%2289.5%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%22106.4%22 y2=%2291.4%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%22104.5%22 y2=%2292.8%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%22102.3%22 y2=%2293.7%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%22100.0%22 y2=%2294.0%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%2297.7%22 y2=%2293.7%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%2295.5%22 y2=%2292.8%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%2293.6%22 y2=%2291.4%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%2292.2%22 y2=%2289.5%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%2291.3%22 y2=%2287.3%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%2291.0%22 y2=%2285.0%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%2291.3%22 y2=%2282.7%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%2292.2%22 y2=%2280.5%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%2293.6%22 y2=%2278.6%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%2295.5%22 y2=%2277.2%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%2297.7%22 y2=%2276.3%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%22100.0%22 y2=%2276.0%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%22102.3%22 y2=%2276.3%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%22104.5%22 y2=%2277.2%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%22106.4%22 y2=%2278.6%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%22107.8%22 y2=%2280.5%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3Cline x1=%22100%22 y1=%2285%22 x2=%22108.7%22 y2=%2282.7%22 stroke=%22%231a3a8f%22 stroke-width=%22.7%22/%3E%3C/svg%3E",
  sankranti: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%220%22 y2=%221%22%3E%3Cstop offset=%220%22 stop-color=%22%23ffb347%22/%3E%3Cstop offset=%221%22 stop-color=%22%23ff6f3c%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22200%22 height=%22200%22 fill=%22url%28%23g%29%22/%3E%3Ccircle cx=%22160%22 cy=%2245%22 r=%2222%22 fill=%22%23fff3b0%22 opacity=%22.85%22/%3E%3Cg transform=%22rotate%28-15 60 60%29%22%3E%3Cpolygon points=%2260,32 79.6,60 60,93.6 40.400000000000006,60%22 fill=%22%23e91e63%22/%3E%3Cpolygon points=%2260,32 79.6,60 60,93.6%22 fill=%22%23ff80ab%22/%3E%3Cline x1=%2260%22 y1=%2232%22 x2=%2260%22 y2=%2293.6%22 stroke=%22%23fff%22 stroke-width=%221%22/%3E%3Cline x1=%2240.400000000000006%22 y1=%2260%22 x2=%2279.6%22 y2=%2260%22 stroke=%22%23fff%22 stroke-width=%221%22/%3E%3Cpath d=%22M60,93.6 q-8,15 0,25 t0,25%22 stroke=%22%23fff%22 stroke-width=%221.3%22 fill=%22none%22/%3E%3C/g%3E%3Cg transform=%22rotate%2812 130 95%29%22%3E%3Cpolygon points=%22130,71 146.8,95 130,123.8 113.2,95%22 fill=%22%231e88e5%22/%3E%3Cpolygon points=%22130,71 146.8,95 130,123.8%22 fill=%22%2390caf9%22/%3E%3Cline x1=%22130%22 y1=%2271%22 x2=%22130%22 y2=%22123.8%22 stroke=%22%23fff%22 stroke-width=%221%22/%3E%3Cline x1=%22113.2%22 y1=%2295%22 x2=%22146.8%22 y2=%2295%22 stroke=%22%23fff%22 stroke-width=%221%22/%3E%3Cpath d=%22M130,123.8 q-8,15 0,25 t0,25%22 stroke=%22%23fff%22 stroke-width=%221.3%22 fill=%22none%22/%3E%3C/g%3E%3Cg transform=%22rotate%280 95 35%29%22%3E%3Cpolygon points=%2295,17 107.6,35 95,56.599999999999994 82.4,35%22 fill=%22%2343a047%22/%3E%3Cpolygon points=%2295,17 107.6,35 95,56.599999999999994%22 fill=%22%23c5e1a5%22/%3E%3Cline x1=%2295%22 y1=%2217%22 x2=%2295%22 y2=%2256.599999999999994%22 stroke=%22%23fff%22 stroke-width=%221%22/%3E%3Cline x1=%2282.4%22 y1=%2235%22 x2=%22107.6%22 y2=%2235%22 stroke=%22%23fff%22 stroke-width=%221%22/%3E%3Cpath d=%22M95,56.599999999999994 q-8,15 0,25 t0,25%22 stroke=%22%23fff%22 stroke-width=%221.3%22 fill=%22none%22/%3E%3C/g%3E%3C/svg%3E",
  ugadi: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%220%22 y2=%221%22%3E%3Cstop offset=%220%22 stop-color=%22%23e8f5e9%22/%3E%3Cstop offset=%221%22 stop-color=%22%23a5d6a7%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22200%22 height=%22200%22 fill=%22url%28%23g%29%22/%3E%3Cpath d=%22M5,30 Q100,60 195,30%22 stroke=%22%235d4037%22 stroke-width=%222%22 fill=%22none%22/%3E%3Cellipse cx=%2220%22 cy=%2254.0%22 rx=%225%22 ry=%2214%22 fill=%22%232e7d32%22 transform=%22rotate%288 20 40.0%29%22/%3E%3Cellipse cx=%2240%22 cy=%2258.104241719908025%22 rx=%225%22 ry=%2214%22 fill=%22%232e7d32%22 transform=%22rotate%28-8 40 44.104241719908025%29%22/%3E%3Cellipse cx=%2260%22 cy=%2261.71345131623847%22 rx=%225%22 ry=%2214%22 fill=%22%232e7d32%22 transform=%22rotate%288 60 47.71345131623847%29%22/%3E%3Cellipse cx=%2280%22 cy=%2264.39230484541326%22 rx=%225%22 ry=%2214%22 fill=%22%232e7d32%22 transform=%22rotate%28-8 80 50.392304845413264%29%22/%3E%3Cellipse cx=%22100%22 cy=%2265.8176930361465%22 rx=%225%22 ry=%2214%22 fill=%22%232e7d32%22 transform=%22rotate%288 100 51.817693036146494%29%22/%3E%3Cellipse cx=%22120%22 cy=%2265.8176930361465%22 rx=%225%22 ry=%2214%22 fill=%22%232e7d32%22 transform=%22rotate%28-8 120 51.817693036146494%29%22/%3E%3Cellipse cx=%22140%22 cy=%2264.39230484541326%22 rx=%225%22 ry=%2214%22 fill=%22%232e7d32%22 transform=%22rotate%288 140 50.392304845413264%29%22/%3E%3Cellipse cx=%22160%22 cy=%2261.713451316238476%22 rx=%225%22 ry=%2214%22 fill=%22%232e7d32%22 transform=%22rotate%28-8 160 47.713451316238476%29%22/%3E%3Cellipse cx=%22180%22 cy=%2258.104241719908025%22 rx=%225%22 ry=%2214%22 fill=%22%232e7d32%22 transform=%22rotate%288 180 44.104241719908025%29%22/%3E%3Cellipse cx=%22200%22 cy=%2254.0%22 rx=%225%22 ry=%2214%22 fill=%22%232e7d32%22 transform=%22rotate%28-8 200 40.0%29%22/%3E%3Ccircle cx=%2230%22 cy=%2236.08377813200316%22 r=%224%22 fill=%22%23ffb300%22/%3E%3Ccircle cx=%2250%22 cy=%2240.0%22 r=%224%22 fill=%22%23ffb300%22/%3E%3Ccircle cx=%2270%22 cy=%2243.19253331742774%22 r=%224%22 fill=%22%23ffb300%22/%3E%3Ccircle cx=%2290%22 cy=%2245.2763114494309%22 r=%224%22 fill=%22%23ffb300%22/%3E%3Ccircle cx=%22110%22 cy=%2246.0%22 r=%224%22 fill=%22%23ffb300%22/%3E%3Ccircle cx=%22130%22 cy=%2245.2763114494309%22 r=%224%22 fill=%22%23ffb300%22/%3E%3Ccircle cx=%22150%22 cy=%2243.19253331742774%22 r=%224%22 fill=%22%23ffb300%22/%3E%3Ccircle cx=%22170%22 cy=%2240.0%22 r=%224%22 fill=%22%23ffb300%22/%3E%3Ccircle cx=%22190%22 cy=%2236.08377813200317%22 r=%224%22 fill=%22%23ffb300%22/%3E%3Cellipse cx=%22100%22 cy=%22150%22 rx=%2262%22 ry=%2222%22 fill=%22%23c9a227%22/%3E%3Cellipse cx=%22100%22 cy=%22146%22 rx=%2252%22 ry=%2216%22 fill=%22%23e6c34a%22/%3E%3Ccircle cx=%2275%22 cy=%22142%22 r=%228%22 fill=%22%23fdd835%22/%3E%3Ccircle cx=%22100%22 cy=%22138%22 r=%228%22 fill=%22%238bc34a%22/%3E%3Ccircle cx=%22125%22 cy=%22142%22 r=%228%22 fill=%22%23e53935%22/%3E%3Ccircle cx=%2288%22 cy=%22153%22 r=%228%22 fill=%22%238d6e63%22/%3E%3Ccircle cx=%22114%22 cy=%22153%22 r=%228%22 fill=%22%23fff59d%22/%3E%3C/svg%3E",
  eid: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%220%22 y2=%221%22%3E%3Cstop offset=%220%22 stop-color=%22%230b3d4a%22/%3E%3Cstop offset=%221%22 stop-color=%22%231d7a7a%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22200%22 height=%22200%22 fill=%22url%28%23g%29%22/%3E%3Cpath d=%22M120,35 A55,55 0 1 0 120,145 A44,44 0 1 1 120,35Z%22 fill=%22%23ffd54f%22/%3E%3Cpolygon points=%22145,55 148,64 158,64 150,70 153,79 145,73 137,79 140,70 132,64 142,64%22 fill=%22%23ffd54f%22/%3E%3Cg fill=%22%2306232b%22%3E%3Crect x=%2220%22 y=%22150%22 width=%22160%22 height=%2250%22/%3E%3Cpath d=%22M70,150 a30,30 0 0 1 60,0Z%22/%3E%3Crect x=%2238%22 y=%22105%22 width=%228%22 height=%2250%22/%3E%3Crect x=%22154%22 y=%22105%22 width=%228%22 height=%2250%22/%3E%3Cpolygon points=%2238,105 42,92 46,105%22/%3E%3Cpolygon points=%22154,105 158,92 162,105%22/%3E%3Crect x=%2299%22 y=%22110%22 width=%222%22 height=%2212%22/%3E%3C/g%3E%3C/svg%3E",
  ramanavami: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%220%22 y2=%221%22%3E%3Cstop offset=%220%22 stop-color=%22%23ffcc80%22/%3E%3Cstop offset=%221%22 stop-color=%22%23ef6c00%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22200%22 height=%22200%22 fill=%22url%28%23g%29%22/%3E%3Ccircle cx=%22100%22 cy=%22100%22 r=%2270%22 fill=%22%23fff3c4%22 opacity=%22.55%22/%3E%3Cpath d=%22M70,25 Q150,100 70,175%22 stroke=%22%235d3a1a%22 stroke-width=%225%22 fill=%22none%22 stroke-linecap=%22round%22/%3E%3Cline x1=%2270%22 y1=%2225%22 x2=%2270%22 y2=%22175%22 stroke=%22%23fff%22 stroke-width=%221.2%22/%3E%3Cline x1=%2240%22 y1=%22100%22 x2=%22165%22 y2=%22100%22 stroke=%22%235d3a1a%22 stroke-width=%223%22/%3E%3Cpolygon points=%22170,100 154,92 154,108%22 fill=%22%235d3a1a%22/%3E%3Cpolygon points=%2240,100 28,92 32,100 28,108%22 fill=%22%23b71c1c%22/%3E%3C/svg%3E",
  //vinayaka:"data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%220%22 y2=%221%22%3E%3Cstop offset=%220%22 stop-color=%22%23ffd180%22/%3E%3Cstop offset=%221%22 stop-color=%22%23ff8f00%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22200%22 height=%22200%22 fill=%22url%28%23g%29%22/%3E%3Ccircle cx=%22100%22 cy=%22100%22 r=%2285%22 fill=%22%23fff3c4%22 opacity=%22.4%22/%3E%3Cellipse cx=%2245%22 cy=%22105%22 rx=%2230%22 ry=%2242%22 fill=%22%23e59a5a%22/%3E%3Cellipse cx=%22155%22 cy=%22105%22 rx=%2230%22 ry=%2242%22 fill=%22%23e59a5a%22/%3E%3Cellipse cx=%2245%22 cy=%22105%22 rx=%2219%22 ry=%2231%22 fill=%22%23f2b98a%22/%3E%3Cellipse cx=%22155%22 cy=%22105%22 rx=%2219%22 ry=%2231%22 fill=%22%23f2b98a%22/%3E%3Cellipse cx=%22100%22 cy=%22100%22 rx=%2242%22 ry=%2248%22 fill=%22%23f0a868%22/%3E%3Cpath d=%22M78,40 L100,12 L122,40 Q100,30 78,40Z%22 fill=%22%23f9c700%22 stroke=%22%23b8860b%22 stroke-width=%221.5%22/%3E%3Ccircle cx=%22100%22 cy=%2224%22 r=%224%22 fill=%22%23e53935%22/%3E%3Cpath d=%22M92,60 L100,52 L108,60%22 stroke=%22%23c62828%22 stroke-width=%223%22 fill=%22none%22/%3E%3Ccircle cx=%2284%22 cy=%2282%22 r=%225%22 fill=%22%23fff%22/%3E%3Ccircle cx=%22116%22 cy=%2282%22 r=%225%22 fill=%22%23fff%22/%3E%3Ccircle cx=%2284%22 cy=%2282%22 r=%222.5%22 fill=%22%23222%22/%3E%3Ccircle cx=%22116%22 cy=%2282%22 r=%222.5%22 fill=%22%23222%22/%3E%3Cpath d=%22M100,92 C85,120 85,150 108,162 C120,168 128,158 122,150%22 stroke=%22%23e08a4a%22 stroke-width=%2218%22 fill=%22none%22 stroke-linecap=%22round%22/%3E%3Cpath d=%22M76,118 Q70,145 84,160%22 stroke=%22%23fff%22 stroke-width=%227%22 fill=%22none%22 stroke-linecap=%22round%22/%3E%3Cpath d=%22M124,118 Q130,140 140,150%22 stroke=%22%23fff%22 stroke-width=%227%22 fill=%22none%22 stroke-linecap=%22round%22 opacity=%220%22/%3E%3C/svg%3E",
  vinayaka: "/holidays/ganesh.jpg",
  dussehra: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%220%22 y2=%221%22%3E%3Cstop offset=%220%22 stop-color=%22%23ff7043%22/%3E%3Cstop offset=%221%22 stop-color=%22%23b71c1c%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22200%22 height=%22200%22 fill=%22url%28%23g%29%22/%3E%3Ccircle cx=%22100%22 cy=%2295%22 r=%2260%22 fill=%22%23ffd54f%22 opacity=%22.35%22/%3E%3Cg stroke=%22%23ffd54f%22 fill=%22none%22 stroke-width=%225%22 stroke-linecap=%22round%22%3E%3Cline x1=%22100%22 y1=%2250%22 x2=%22100%22 y2=%22185%22/%3E%3Cpath d=%22M60,55 Q60,105 100,105 Q140,105 140,55%22/%3E%3C/g%3E%3Cg fill=%22%23ffd54f%22%3E%3Cpolygon points=%22100,22 92,52 108,52%22/%3E%3Cpolygon points=%2260,32 52,60 68,60%22/%3E%3Cpolygon points=%22140,32 132,60 148,60%22/%3E%3C/g%3E%3Ccircle cx=%22100%22 cy=%22125%22 r=%225%22 fill=%22%23ffd54f%22/%3E%3C/svg%3E",
  diwali: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%220%22 y2=%221%22%3E%3Cstop offset=%220%22 stop-color=%22%231a0f3a%22/%3E%3Cstop offset=%221%22 stop-color=%22%234a1b4f%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22200%22 height=%22200%22 fill=%22url%28%23g%29%22/%3E%3Ccircle cx=%2220%22 cy=%2230%22 r=%228%22 fill=%22%23ffca28%22 opacity=%22.35%22/%3E%3Ccircle cx=%22170%22 cy=%2225%22 r=%2211%22 fill=%22%23ffca28%22 opacity=%22.35%22/%3E%3Ccircle cx=%22150%22 cy=%2270%22 r=%225%22 fill=%22%23ffca28%22 opacity=%22.35%22/%3E%3Ccircle cx=%2235%22 cy=%2280%22 r=%226%22 fill=%22%23ffca28%22 opacity=%22.35%22/%3E%3Ccircle cx=%22180%22 cy=%22120%22 r=%227%22 fill=%22%23ffca28%22 opacity=%22.35%22/%3E%3Ccircle cx=%2215%22 cy=%22140%22 r=%225%22 fill=%22%23ffca28%22 opacity=%22.35%22/%3E%3Ccircle cx=%22100%22 cy=%22120%22 r=%2255%22 fill=%22%23ff9800%22 opacity=%22.18%22/%3E%3Cg transform=%22translate%28100 130%29 scale%281.2%29%22%3E%3Cellipse cx=%220%22 cy=%2222%22 rx=%2230%22 ry=%228%22 fill=%22%236d2d0a%22 opacity=%22.5%22/%3E%3Cpath d=%22M-30,6 Q0,38 30,6 Q0,14 -30,6Z%22 fill=%22%23c75b1a%22/%3E%3Cellipse cx=%220%22 cy=%226%22 rx=%2230%22 ry=%226%22 fill=%22%23e07a2a%22/%3E%3Cpath d=%22M0,-28 Q12,-8 0,4 Q-12,-8 0,-28Z%22 fill=%22%23ffb300%22/%3E%3Cpath d=%22M0,-16 Q6,-6 0,2 Q-6,-6 0,-16Z%22 fill=%22%23fff3a0%22/%3E%3C/g%3E%3Cg transform=%22translate%2845 165%29 scale%280.7%29%22%3E%3Cellipse cx=%220%22 cy=%2222%22 rx=%2230%22 ry=%228%22 fill=%22%236d2d0a%22 opacity=%22.5%22/%3E%3Cpath d=%22M-30,6 Q0,38 30,6 Q0,14 -30,6Z%22 fill=%22%23c75b1a%22/%3E%3Cellipse cx=%220%22 cy=%226%22 rx=%2230%22 ry=%226%22 fill=%22%23e07a2a%22/%3E%3Cpath d=%22M0,-28 Q12,-8 0,4 Q-12,-8 0,-28Z%22 fill=%22%23ffb300%22/%3E%3Cpath d=%22M0,-16 Q6,-6 0,2 Q-6,-6 0,-16Z%22 fill=%22%23fff3a0%22/%3E%3C/g%3E%3Cg transform=%22translate%28155 165%29 scale%280.7%29%22%3E%3Cellipse cx=%220%22 cy=%2222%22 rx=%2230%22 ry=%228%22 fill=%22%236d2d0a%22 opacity=%22.5%22/%3E%3Cpath d=%22M-30,6 Q0,38 30,6 Q0,14 -30,6Z%22 fill=%22%23c75b1a%22/%3E%3Cellipse cx=%220%22 cy=%226%22 rx=%2230%22 ry=%226%22 fill=%22%23e07a2a%22/%3E%3Cpath d=%22M0,-28 Q12,-8 0,4 Q-12,-8 0,-28Z%22 fill=%22%23ffb300%22/%3E%3Cpath d=%22M0,-16 Q6,-6 0,2 Q-6,-6 0,-16Z%22 fill=%22%23fff3a0%22/%3E%3C/g%3E%3C/svg%3E",
  christmas: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%220%22 y2=%221%22%3E%3Cstop offset=%220%22 stop-color=%22%230d2a4a%22/%3E%3Cstop offset=%221%22 stop-color=%22%2316405c%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22200%22 height=%22200%22 fill=%22url%28%23g%29%22/%3E%3Ccircle cx=%220%22 cy=%220%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%2237%22 cy=%2253%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%2274%22 cy=%22106%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%22111%22 cy=%22159%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%22148%22 cy=%2212%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%22185%22 cy=%2265%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%2222%22 cy=%22118%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%2259%22 cy=%22171%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%2296%22 cy=%2224%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%22133%22 cy=%2277%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%22170%22 cy=%22130%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%227%22 cy=%22183%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%2244%22 cy=%2236%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%2281%22 cy=%2289%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%22118%22 cy=%22142%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%22155%22 cy=%22195%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%22192%22 cy=%2248%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%2229%22 cy=%22101%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%2266%22 cy=%22154%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%22103%22 cy=%227%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%22140%22 cy=%2260%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%22177%22 cy=%22113%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%2214%22 cy=%22166%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%2251%22 cy=%2219%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%2288%22 cy=%2272%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%22125%22 cy=%22125%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%22162%22 cy=%22178%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%22199%22 cy=%2231%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%2236%22 cy=%2284%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Ccircle cx=%2273%22 cy=%22137%22 r=%221.8%22 fill=%22%23fff%22 opacity=%22.8%22/%3E%3Cpolygon points=%22100,38 70,95 130,95%22 fill=%22%232e7d32%22/%3E%3Cpolygon points=%22100,70 60,130 140,130%22 fill=%22%23388e3c%22/%3E%3Cpolygon points=%22100,105 50,168 150,168%22 fill=%22%2343a047%22/%3E%3Crect x=%2292%22 y=%22168%22 width=%2216%22 height=%2216%22 fill=%22%236d4c41%22/%3E%3Cpolygon points=%22100,18 104,31 118,31 107,39 111,52 100,44 89,52 93,39 82,31 96,31%22 fill=%22%23ffd54f%22/%3E%3Ccircle cx=%2290%22 cy=%2285%22 r=%224%22 fill=%22%23e53935%22/%3E%3Ccircle cx=%22112%22 cy=%22100%22 r=%224%22 fill=%22%23ffd54f%22/%3E%3Ccircle cx=%2280%22 cy=%22118%22 r=%224%22 fill=%22%2342a5f5%22/%3E%3Ccircle cx=%22120%22 cy=%22128%22 r=%224%22 fill=%22%23e53935%22/%3E%3Ccircle cx=%2295%22 cy=%22148%22 r=%224%22 fill=%22%23ffd54f%22/%3E%3Ccircle cx=%2270%22 cy=%22152%22 r=%224%22 fill=%22%23e53935%22/%3E%3Ccircle cx=%22130%22 cy=%22158%22 r=%224%22 fill=%22%2342a5f5%22/%3E%3C/svg%3E",
  gandhi: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%220%22 y2=%221%22%3E%3Cstop offset=%220%22 stop-color=%22%23fff3e0%22/%3E%3Cstop offset=%221%22 stop-color=%22%23ffcc80%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22200%22 height=%22200%22 fill=%22url%28%23g%29%22/%3E%3Cg fill=%22none%22 stroke=%22%233e2723%22 stroke-width=%224%22%3E%3Ccircle cx=%2265%22 cy=%2280%22 r=%2227%22/%3E%3Ccircle cx=%22135%22 cy=%2280%22 r=%2227%22/%3E%3Cpath d=%22M92,76 Q100,68 108,76%22/%3E%3Cline x1=%2238%22 y1=%2278%22 x2=%2218%22 y2=%2270%22/%3E%3Cline x1=%22162%22 y1=%2278%22 x2=%22182%22 y2=%2270%22/%3E%3C/g%3E%3Ccircle cx=%22150%22 cy=%22140%22 r=%2224%22 fill=%22none%22 stroke=%22%235d4037%22 stroke-width=%223%22/%3E%3Cline x1=%22150%22 y1=%22140%22 x2=%22172.0%22 y2=%22140.0%22 stroke=%22%235d4037%22 stroke-width=%221.5%22/%3E%3Cline x1=%22150%22 y1=%22140%22 x2=%22169.1%22 y2=%22151.0%22 stroke=%22%235d4037%22 stroke-width=%221.5%22/%3E%3Cline x1=%22150%22 y1=%22140%22 x2=%22161.0%22 y2=%22159.1%22 stroke=%22%235d4037%22 stroke-width=%221.5%22/%3E%3Cline x1=%22150%22 y1=%22140%22 x2=%22150.0%22 y2=%22162.0%22 stroke=%22%235d4037%22 stroke-width=%221.5%22/%3E%3Cline x1=%22150%22 y1=%22140%22 x2=%22139.0%22 y2=%22159.1%22 stroke=%22%235d4037%22 stroke-width=%221.5%22/%3E%3Cline x1=%22150%22 y1=%22140%22 x2=%22130.9%22 y2=%22151.0%22 stroke=%22%235d4037%22 stroke-width=%221.5%22/%3E%3Cline x1=%22150%22 y1=%22140%22 x2=%22128.0%22 y2=%22140.0%22 stroke=%22%235d4037%22 stroke-width=%221.5%22/%3E%3Cline x1=%22150%22 y1=%22140%22 x2=%22130.9%22 y2=%22129.0%22 stroke=%22%235d4037%22 stroke-width=%221.5%22/%3E%3Cline x1=%22150%22 y1=%22140%22 x2=%22139.0%22 y2=%22120.9%22 stroke=%22%235d4037%22 stroke-width=%221.5%22/%3E%3Cline x1=%22150%22 y1=%22140%22 x2=%22150.0%22 y2=%22118.0%22 stroke=%22%235d4037%22 stroke-width=%221.5%22/%3E%3Cline x1=%22150%22 y1=%22140%22 x2=%22161.0%22 y2=%22120.9%22 stroke=%22%235d4037%22 stroke-width=%221.5%22/%3E%3Cline x1=%22150%22 y1=%22140%22 x2=%22169.1%22 y2=%22129.0%22 stroke=%22%235d4037%22 stroke-width=%221.5%22/%3E%3Ccircle cx=%22150%22 cy=%22140%22 r=%224%22 fill=%22%235d4037%22/%3E%3Crect x=%2230%22 y=%22150%22 width=%2270%22 height=%228%22 rx=%223%22 fill=%22%238d6e63%22/%3E%3C/svg%3E",
};

/* Match by holiday name (if API sends one) */
const NAME_RULES = [
  [/republic|independence/i, "flag"],
  [/sankranti|pongal/i, "sankranti"],
  [/ugadi/i, "ugadi"],
  [/eid|ramzan|ramadan/i, "eid"],
  [/rama\s*navami/i, "ramanavami"],
  [/vinayaka|ganesh/i, "vinayaka"],
  [/dussehra|dasara|vijayadashami/i, "dussehra"],
  [/diwali|deepavali/i, "diwali"],
  [/christmas/i, "christmas"],
  [/gandhi/i, "gandhi"],
];
const getHolidayImage = (name) => {
  if (!name) return null;

  const hit = NAME_RULES.find(([re]) => re.test(name));
  return hit ? HOLIDAY_IMAGES[hit[1]] : null;
};

function Calender({ selectedDate, onDateSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const navigate = useNavigate();
  const role = getUserRole();
  const [hoursMap, setHoursMap] = useState({});
  const [namesMap, setNamesMap] = useState({});
  const [failedImages, setFailedImages] = useState({});
  const [loading, setLoading] = useState(false);

  // Store API errors for the existing fallback modal.
  const [apiError, setApiError] = useState(null);

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth(); //0-11
  const month = monthIndex + 1; //1-12

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from({ length: 21 }, (_, i) => 2020 + i);
  // Fetch calendar data
  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL.replace(/\/$/, "")}/calendar/date-range?month=${month}&year=${year}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add Authorization if required
            "Authorization": `Bearer ${getAccessToken() || ""}`,
          },
        }
      );

      // Preserve the HTTP status for the shared API error handler.
      if (!response.ok) {
        const error = new Error(`HTTP error! Status: ${response.status}`);
        error.response = { status: response.status };
        throw error;
      }

      const data = await response.json();

      /* Convert API object into simple hours map */
      const formattedMap = {};
      const formattedNames = {};
      const calendarData = data.date || {};

      Object.entries(calendarData).forEach(([key, entry]) => {
        if (!entry) return;

        if (entry.status === "leave") {
          formattedMap[key] = "leave";
        } else if (entry.status === "pending") {
          formattedMap[key] = "pending";
        } else if (
          entry.status === "publicholiday" ||
          entry.status === "public_holiday" ||
          entry.status === "public holiday"
        ) {
          formattedMap[key] = "publicholiday";
          /* Holiday name comes from API description */
          formattedNames[key] = (entry.description || "").trim();
        } else {
          formattedMap[key] = entry.hours || 0;
        }
      });

      setHoursMap(formattedMap);
      setNamesMap(formattedNames);
    } catch (error) {
      // Use the existing session-expiry flow for unauthorized requests.
      if (error?.response?.status === 401) {
        setApiError(null);
        window.dispatchEvent(new Event("session-expired"));
        return;
      }

      // Show the shared fallback modal for other API failures.
      // Store the API error for the fallback modal.
      setApiError({
        title: "Unable to Load Calendar",
        message: getApiErrorMessage(
          error,
          "Unable to load calendar data. Please try again."
        ),
      });
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  /* Fetch calendar data when month/year changes */
  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  /* Refresh calendar after timesheet submission */
  useEffect(() => {
    const refreshCalendar = () => {
      fetchCalendarData();
    };

    window.addEventListener("timesheetSubmitted", refreshCalendar);

    return () => {
      window.removeEventListener("timesheetSubmitted", refreshCalendar);
    };
  }, [fetchCalendarData]);

  const firstDay = new Date(year, monthIndex, 1);
  const lastDate = new Date(year, monthIndex + 1, 0).getDate();
  const startDay = (firstDay.getDay() + 6) % 7;

  const prevMonth = () => setCurrentDate(new Date(year, monthIndex - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, monthIndex + 1, 1));

  const dateKey = (d) => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const isSameDay = (d1, d2) =>
    d1 && d2 && d1.toDateString() === d2.toDateString();

  const isWeekend = (date) =>
    date.getDay() === 0 || date.getDay() === 6;

  /* Weekly progress */
  const getWeekHours = () => {
    if (!selectedDate) return 0;

    const start = new Date(selectedDate);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

    let total = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      if (isWeekend(d)) continue;

      const val = hoursMap[dateKey(d)];
      if (val === "leave") continue;

      const h = parseFloat(val);
      if (!isNaN(h)) total += h;
    }
    return total;
  };

  const weeklyHours = getWeekHours();
  const weeklyTarget = 40;
  const progressPercent = Math.min(
    (weeklyHours / weeklyTarget) * 100,
    100
  );

  return (
    <>
      {/* Show API errors */}
      {apiError && (
        <ApiErrorModal
          title={apiError.title}
          message={apiError.message}
          onRetry={() => {
            setApiError(null);
            fetchCalendarData();
          }}
          onClose={() => setApiError(null)}
        />
      )}
      {loading && (
        <div className="fixed inset-0 bg-black/40 z-9999 flex items-center justify-center">

          <div className="p-6 flex flex-col items-center gap-3">

            <FiLoader className="animate-spin text-4xl text-green-800" />

            <p className="text-gray-700 font-medium">
              Please wait...
            </p>

          </div>
        </div>
      )}
      <div
        className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 md:p-5 xl:p-6 overflow-hidden"
      >

        {/* Header */}
        <div className="flex justify-between items-center mb-4 relative">

          {/* Month + Year */}
          <div className="flex items-center gap-2">

            {/* Month Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowMonthDropdown(!showMonthDropdown);
                  setShowYearDropdown(false);
                }}
                className="font-semibold text-base sm:text-lg xl:text-xl"
              >
                {months[monthIndex]}
              </button>

              {showMonthDropdown && (
                <div className="absolute top-10 left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-28 max-h-60 overflow-y-auto">
                  {months.map((m, index) => (
                    <div
                      key={m}
                      onClick={() => {
                        setCurrentDate(new Date(year, index, 1));
                        setShowMonthDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {m}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Year Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowYearDropdown(!showYearDropdown);
                  setShowMonthDropdown(false);
                }}
                className="font-semibold text-base sm:text-lg xl:text-xl"
              >
                {year}
              </button>

              {showYearDropdown && (
                <div className="absolute top-10 left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-28 max-h-60 overflow-y-auto">
                  {years.map((y) => (
                    <div
                      key={y}
                      onClick={() => {
                        setCurrentDate(new Date(y, monthIndex, 1));
                        setShowYearDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {y}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Arrows */}
          <div className="flex gap-2">
            <button onClick={prevMonth}>
              <ChevronLeft size={18} />
            </button>

            <button onClick={nextMonth}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Weekdays */}
        <div
          className="grid grid-cols-7 gap-1 text-[8px] sm:text-[10px] md:text-xs text-gray-400 text-center mb-2"
        >
          {weekDays.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Calendar Dates */}
        <div className="grid grid-cols-7 min-w-0 gap-1 sm:gap-2 md:gap-2.5 text-center"
        >
          {[...Array(startDay)].map((_, i) => (
            <div key={i} />
          ))}

          {[...Array(lastDate)].map((_, i) => {
            const date = new Date(year, monthIndex, i + 1);
            const key = dateKey(date);
            const weekend = isWeekend(date);
            const value = hoursMap[key];
            const selected = isSameDay(date, selectedDate);

            let bg = "bg-white border-gray-200";
            let label = "0h";
            let holidayImg = null;

            if (weekend) {
              bg = "bg-gray-100 border-gray-400 text-gray-400";
            }
            else if (value === "leave") {
              bg = "bg-red-50 border-red-200 text-red-600";
              label = "leave";
            }
            else if (value === "pending") {
              bg = "bg-gray-100 border-gray-400 text-gray-400";
              label = "pending";
            }
            else if (value === "publicholiday") {
              bg = "bg-blue-100 border-blue-300 text-blue-700";
              label = "public hol";

              /* photo only if we have one and it loaded; otherwise default blue */
              const img = getHolidayImage(namesMap[key]);
              if (img && !failedImages[img]) holidayImg = img;
            }
            else if (Number(value) >= 8) {
              bg = "bg-green-50 border-green-200 text-green-700";
              label = `${value}h`;
            }
            else if (Number(value) > 0) {
              bg = "bg-yellow-50 border-yellow-200 text-yellow-700";
              label = `${value}h`;
            }
            return (
              <div
                key={i}
                title={value === "publicholiday" ? namesMap[key] || undefined : undefined}
                onClick={() =>
                  onDateSelect({
                    date,
                    status: value
                  })
                }
                className={`flex flex-col items-center justify-center h-11 sm:h-13.5 md:h-15.5 lg:h-17 w-full min-w-0 rounded-lg border text-[10px] sm:text-xs md:text-sm leading-none transition-all duration-200
                 ${bg} ${holidayImg ? "relative overflow-hidden" : ""} 
                 ${selected ? "ring-2 ring-green-600" : ""}
                 ${weekend ? "cursor-not-allowed" : "cursor-pointer hover:bg-gray-100" }`}
              >
                {holidayImg && (
                  <>
                    <img
                      src={holidayImg}
                      alt=""
                      loading="lazy"
                      onError={() =>
                        setFailedImages((p) => ({ ...p, [holidayImg]: true }))
                      }
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                  </>
                )}

                <span
                  className={
                    holidayImg
                      ? "relative z-10 text-white font-semibold drop-shadow"
                      : ""
                  }
                >
                  {i + 1}
                </span>
                <div
                  className={`text-[7px] sm:text-[8px] md:text-[9px] mt-0.5 sm:mt-1 font-medium truncate max-w-full 
                  ${holidayImg ? "relative z-10 text-white drop-shadow" : ""}`}
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <hr className="my-6 border-gray-200" />

        {/* Legend */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-[11px] sm:text-xs text-gray-600"
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-green-100 border"></span>
            Filled
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-yellow-100 border"></span>
            Partially Filled
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-white border"></span>
            Not Filled
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-100 border"></span>
            Leave
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-100 border"></span>
            Public Holiday
          </div>
        </div>

        {/* Divider */}
        <hr className="my-6 border-gray-200" />

        {/* Weekly Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-700">
              Weekly Progress
            </p>
            <p className="text-sm font-semibold">
              {weeklyHours.toFixed(1)} / {weeklyTarget}h
            </p>
          </div>

          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-green-700 h-2 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-xs text-gray-400 mt-2">
            You need {(weeklyTarget - weeklyHours).toFixed(1)} more hours
            to reach your weekly target.
          </p>
        </div>

        <hr className="my-3 border-gray-200" />

        {role !== "super admin" ? (
          <button
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("leave-event", {
                  detail: "open-leave-modal",
                })
              )
            }
            className="w-full mt-4 bg-green-800 text-white text-sm sm:text-base font-medium shadow-sm py-2.5 sm:py-3 rounded-xl hover:bg-green-700 transition-all"
          >
            Apply for Leave
          </button>
        ) : (
          <button
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("holiday-event", {
                  detail: "open-holiday-modal",
                })
              )
            }
            className="w-full mt-4 bg-green-800 text-white text-sm sm:text-base font-medium shadow-sm py-2.5 sm:py-3 rounded-xl hover:bg-green-700 transition-all"
          >
            Add Public Holiday
          </button>
        )}

        <button
          onClick={() =>
            navigate(
              role === "employee"
                ? "/employee-dashboard/leave-requests"
                : "/dashboard/leave-requests"
            )
          }
          className="w-full mt-4 bg-green-800 text-white text-sm sm:text-base font-medium shadow-sm py-2.5 sm:py-3 rounded-xl hover:bg-green-700 transition-all"
        >
          Leave Requests
        </button>
      </div>
    </>
  );
}
export default Calender;