import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"; // core Redux hooks
import type { RootState, AppDispatch } from "../store"; // import store types

// create and export a typed useDispatch hook using AppDispatch type
export const useAppDispatch: () => AppDispatch = useDispatch;

// create and export a typed useSelector hook using RootState type
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;