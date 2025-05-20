import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

/**
 * Type definition for art location data
 */
export interface ArtLocationData {
  orderId: number;
  location: string;
  artworkType: string;
  artworkDescription: string;
  artworkWidth: number;
  artworkHeight: number;
}

/**
 * Service for handling artwork location operations
 */
const artLocationService = {
  /**
   * Sends artwork location data to the Art Locations app
   * @param data Location data to send
   * @returns Promise with the response data
   */
  async sendArtLocationData(data: ArtLocationData): Promise<any> {
    try {
      const response = await apiRequest('POST', `/api/orders/${data.orderId}/location`, data);
      const result = await response.json();
      
      toast({
        title: "Location Updated",
        description: "Artwork location has been successfully recorded.",
        variant: "default",
      });
      
      return result;
    } catch (error) {
      console.error('Error sending art location data:', error);
      toast({
        title: "Location Update Failed",
        description: "Could not update artwork location. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  },
  
  /**
   * Gets artwork location data for an order
   * @param orderId Order ID
   * @returns Promise with location data
   */
  async getArtLocationData(orderId: number): Promise<ArtLocationData> {
    try {
      const response = await apiRequest('GET', `/api/orders/${orderId}/location`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching art location data:', error);
      toast({
        title: "Fetch Failed",
        description: "Could not retrieve artwork location data.",
        variant: "destructive",
      });
      throw error;
    }
  }
};

export default artLocationService;