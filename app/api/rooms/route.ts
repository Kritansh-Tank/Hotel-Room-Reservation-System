export async function GET() {
  return Response.json({
    rooms: [
      { id: 1, name: "Deluxe Room", price: 150 },
      { id: 2, name: "Standard Room", price: 100 },
      { id: 3, name: "Suite", price: 250 },
    ],
  });
}
