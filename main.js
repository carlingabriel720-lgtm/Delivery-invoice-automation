const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

function procesarFacturaGemini(e) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = e.range.getRow();
  const rowValues = e.values;

  // Asumimos que la Marca temporal está en A y la foto se guarda en la columna B (índice 1).
  const urlArchivo = rowValues[1]; 
  
  if (!urlArchivo) return; // Si no hay foto, no hace nada.

  try {
    // 1. Extraer ID del archivo de Drive
    const fileId = extraerIdDrive(urlArchivo);
    if (!fileId) throw new Error("No se pudo extraer el ID del archivo");
    
    const file = DriveApp.getFileById(fileId);
    const base64Image = Utilities.base64Encode(file.getBlob().getBytes());
    const mimeType = file.getMimeType();

    // 2. Preparar el Prompt para Gemini
    const promptText = `
      Actúa como un auditor de costos de restaurantes. Analiza esta imagen de una factura o ticket de compra.
      Extrae la siguiente información y devuelve ÚNICAMENTE un objeto JSON válido.
      Si no encuentras un dato, coloca "No detectado" o 0 en el caso de campos numéricos. No uses símbolos de moneda en los números.

      Estructura requerida:
      {
        "proveedor": "Nombre de la empresa o distribuidor",
        "numero_factura": "ID o número de ticket",
        "fecha_factura": "DD/MM/AAAA",
        "categoria": "Asigna una sola: Proteínas, Lácteos, Verdes, Abarrotes, Bebidas, Limpieza, Otros",
        "detalle_productos": "Breve resumen de los insumos (ej: 2kg Tomate, 5kg Carne)",
        "subtotal": 0.00,
        "impuestos": 0.00,
        "total": 0.00,
        "metodo_pago": "Efectivo, Tarjeta, Crédito o No detectado"
      }
    `;

    // 3. Llamada a la API de Gemini 1.5 Flash (VERSIÓN CORREGIDA AQUÍ)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const payload = {
      "contents": [{
        "parts": [
          {"text": promptText},
          {
            "inline_data": {
              "mime_type": mimeType,
              "data": base64Image
            }
          }
        ]
      }],
      "generationConfig": {
         "response_mime_type": "application/json" // Obliga a Gemini a devolver JSON puro
      }
    };

    const options = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    };

    const response = UrlFetchApp.fetch(apiUrl, options);
    const jsonResponse = JSON.parse(response.getContentText());

    // 4. Procesar la respuesta
    if (jsonResponse.error) {
       throw new Error(jsonResponse.error.message);
    }
    
    const rawText = jsonResponse.candidates[0].content.parts[0].text;
    const datos = JSON.parse(rawText);

    // 5. Escribir los datos extraídos en la misma fila del Google Sheet
    sheet.getRange(row, 2).setValue(datos.proveedor);            // Col B
    sheet.getRange(row, 3).setValue(datos.numero_factura);       // Col C
    sheet.getRange(row, 4).setValue(datos.fecha_factura);        // Col D
    sheet.getRange(row, 5).setValue(datos.categoria);            // Col E
    sheet.getRange(row, 6).setValue(datos.detalle_productos);    // Col F
    sheet.getRange(row, 7).setValue(datos.subtotal);             // Col G
    sheet.getRange(row, 8).setValue(datos.impuestos);            // Col H
    sheet.getRange(row, 9).setValue(datos.total);                // Col I
    sheet.getRange(row, 10).setValue(datos.metodo_pago);         // Col J
    sheet.getRange(row, 11).setValue("Pendiente");               // Col K (Estatus Contable)
    sheet.getRange(row, 12).setValue(urlArchivo);                // Col L (Movemos el link aquí)
    sheet.getRange(row, 13).setValue("Ok (Automatizado)");       // Col M (Estatus IA)

  } catch (error) {
    // Si la IA falla, anota el error pero no borra el link de la foto
    sheet.getRange(row, 12).setValue(urlArchivo); 
    sheet.getRange(row, 13).setValue("Error IA: " + error.toString());
  }
}

// Función auxiliar para sacar el ID puro del archivo de Google Drive
function extraerIdDrive(url) {
  const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}


function verModelosDisponibles() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  const response = UrlFetchApp.fetch(url);
  console.log(response.getContentText());
}
