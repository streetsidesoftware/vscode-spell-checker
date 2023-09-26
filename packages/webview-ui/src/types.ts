export interface WebViewState {
    showVsCodeComponents?: boolean;
}

export type ChangeEvent<T extends EventTarget = Element, E extends Event = Event> = E & { currentTarget: EventTarget & T; target: T };
export type TextInputEvent<T extends EventTarget = HTMLInputElement, E extends InputEvent = InputEvent> = E & { target: T };
