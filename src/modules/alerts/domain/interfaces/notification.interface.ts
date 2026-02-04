export interface INotificationService {
    sendPriceAlert(
        userEmail: string,
        userName: string,
        assetTicker: string,
        currentPrice: number,
        targetPrice: number,
        condition: string
    ): Promise<void>;
}
