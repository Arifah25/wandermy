const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };
  
//   async function run() {
    export const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: "Generate travel plan name Semester Break for location: Ipoh, Perak, Malaysia, for 1 days and 1 night for family with a luxury budget with a flight details, flight price with booking url, hotels option list with hotelname, hotel address, price, hotel image url, geo coordinates, rating, descriptions and places to visit nearby with placename, place details, place image url, geo coordinates, ticket pricing, operating hour, time t travel each of the location for 1 days and 1 night with each day plan with best time to visit in JSON format"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "```json\n{\n  \"trip_details\": {\n    \"tripName\": \"Semester Break\",\n    \"image_url\": \"https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcQYHAA33GfRcr4n5a8RXCfz_xKzDb28kkKtmf25iS1RWbeQXqphDO5peHO5i-J_K_X2pbKMJZXZQx5ix1YFE74nQFgfWrmX4I9tgm3haA\",\n    \"destination\": \"Ipoh, Perak, Malaysia\",\n    \"duration\": \"1 day and 1 night\",\n    \"budget\": \"luxury\",\n    \"travelers\": \"family\"\n  },\n  \"flight_details\": {\n    \"flight_options\": [\n      {\n        \"airline\": \"AirAsia\",\n        \"flight_number\": \"AK6218\",\n        \"departure_city\": \"Kuala Lumpur\",\n        \"arrival_city\": \"Ipoh\",\n        \"departure_date\": \"2023-11-20\",\n        \"departure_time\": \"10:00 AM\",\n        \"arrival_date\": \"2023-11-20\",\n        \"arrival_time\": \"11:00 AM\",\n        \"price\": \"$50\",\n        \"booking_url\": \"https://www.airasia.com/en/my/book-flights.html\"\n      },\n      {\n        \"airline\": \"Malaysia Airlines\",\n        \"flight_number\": \"MH1345\",\n        \"departure_city\": \"Kuala Lumpur\",\n        \"arrival_city\": \"Ipoh\",\n        \"departure_date\": \"2023-11-20\",\n        \"departure_time\": \"12:00 PM\",\n        \"arrival_date\": \"2023-11-20\",\n        \"arrival_time\": \"1:00 PM\",\n        \"price\": \"$75\",\n        \"booking_url\": \"https://www.malaysiaairlines.com/my/en/home.html\"\n      }\n    ]\n  },\n  \"hotel_options\": [\n    {\n      \"hotel_name\": \"The Banjaran Hotsprings Retreat\",\n      \"hotel_address\": \"1, Persiaran Lagun Sunway, 31900 Ipoh, Perak, Malaysia\",\n      \"price\": \"$350+\",\n      \"hotel_image_url\": \"https://www.thebanjaran.com/images/thebanjaran-hotsprings-retreat-ipoh-perak-malaysia-hero-banner.jpg\",\n      \"geo_coordinates\": \"4.5718, 101.0722\",\n      \"rating\": 4.5,\n      \"description\": \"A luxurious and secluded retreat with stunning natural hot springs and spa facilities.\",\n      \"places_to_visit_nearby\": [\n        {\n          \"place_name\": \"Lost World of Tambun\",\n          \"place_details\": \"A theme park with water rides, animal encounters, and hot springs.\",\n          \"place_image_url\": \"https://www.sunway.com.my/lost-world-of-tambun/media/images/Lost_World_of_Tambun_Homepage_Image.jpg\",\n          \"geo_coordinates\": \"4.5695, 101.0656\",\n          \"ticket_pricing\": \"Adult: RM120, Child: RM80\",\n          \"operating_hours\": \"10:00 AM - 6:00 PM\",\n          \"time_to_travel\": \"15 minutes\"\n        }\n      ]\n    },\n    {\n      \"hotel_name\": \"The Haven Ipoh\",\n      \"hotel_address\": \"160, Jalan Raja Dr. Nazrin Shah, 30300 Ipoh, Perak, Malaysia\",\n      \"price\": \"$150+\",\n      \"hotel_image_url\": \"https://www.thehavenipoh.com/wp-content/uploads/2019/11/The-Haven-Ipoh-Exterior.jpg\",\n      \"geo_coordinates\": \"4.5965, 101.0652\",\n      \"rating\": 4,\n      \"description\": \"A modern and stylish hotel with rooftop infinity pool and stunning city views.\",\n      \"places_to_visit_nearby\": [\n        {\n          \"place_name\": \"Ipoh Old Town\",\n          \"place_details\": \"A historic area with colonial-era buildings, street art, and delicious food.\",\n          \"place_image_url\": \"https://www.malaysiatrip.com/wp-content/uploads/2019/06/Ipoh-Old-Town-Street-Art-7-min.jpg\",\n          \"geo_coordinates\": \"4.5977, 101.0655\",\n          \"ticket_pricing\": \"Free\",\n          \"operating_hours\": \"24 hours\",\n          \"time_to_travel\": \"5 minutes\"\n        }\n      ]\n    }\n  ],\n  \"day_plan\": [\n    {\n      \"day\": \"Day 1\",\n      \"activities\": [\n        {\n          \"activity_name\": \"Check-in at hotel and relax\",\n          \"time\": \"12:00 PM - 3:00 PM\"\n        },\n        {\n          \"activity_name\": \"Lunch at a luxurious restaurant in Ipoh Old Town\",\n          \"time\": \"3:00 PM - 4:00 PM\"\n        },\n        {\n          \"activity_name\": \"Explore Ipoh Old Town and admire the street art\",\n          \"time\": \"4:00 PM - 6:00 PM\"\n        },\n        {\n          \"activity_name\": \"Visit the Ipoh Municipal Building and the Ipoh Railway Station\",\n          \"time\": \"6:00 PM - 7:00 PM\"\n        },\n        {\n          \"activity_name\": \"Dinner at a renowned restaurant in Ipoh\",\n          \"time\": \"7:00 PM - 9:00 PM\"\n        }\n      ]\n    },\n    {\n      \"day\": \"Day 2\",\n      \"activities\": [\n        {\n          \"activity_name\": \"Visit the Kek Lok Tong Temple\",\n          \"time\": \"9:00 AM - 11:00 AM\"\n        },\n        {\n          \"activity_name\": \"Visit the Sam Poh Tong Cave Temple\",\n          \"time\": \"11:00 AM - 1:00 PM\"\n        },\n        {\n          \"activity_name\": \"Lunch at a local restaurant near the temples\",\n          \"time\": \"1:00 PM - 2:00 PM\"\n        },\n        {\n          \"activity_name\": \"Enjoy a relaxing afternoon at the hotel\",\n          \"time\": \"2:00 PM - 5:00 PM\"\n        },\n        {\n          \"activity_name\": \"Have a luxurious high tea at the hotel\",\n          \"time\": \"5:00 PM - 6:00 PM\"\n        },\n        {\n          \"activity_name\": \"Check out from the hotel\",\n          \"time\": \"7:00 PM\"\n        },\n        {\n          \"activity_name\": \"Enjoy dinner at a restaurant near the airport\",\n          \"time\": \"7:00 PM - 8:00 PM\"\n        },\n        {\n          \"activity_name\": \"Depart from Ipoh Airport\",\n          \"time\": \"9:00 PM\"\n        }\n      ]\n    }\n  ]\n}\n```\n\n**Notes:**\n\n* This is a sample itinerary and can be customized based on your family's interests and preferences.\n* The flight details and prices are for reference only.\n* The hotel prices are approximate and may vary depending on the season and availability.\n* The places to visit nearby are just a few suggestions and you can explore other options based on your interests.\n* The time to travel between locations is estimated and may vary depending on traffic conditions.\n* It is recommended to book flights and accommodation in advance, especially if traveling during peak season."},
          ],
        },
      ],
    });
  
    // const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    // console.log(result.response.text());
//   }
  
//   run();