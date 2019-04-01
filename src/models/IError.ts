interface IError {
    status: number,
    message?: string,
    internalCode?: number,
    trackingId?: string
}