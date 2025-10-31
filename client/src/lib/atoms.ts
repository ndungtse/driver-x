import { atom } from "jotai";
import { DailyLog } from "@/types/models";

export const activeDailyLogAtom = atom<DailyLog | null>(null);