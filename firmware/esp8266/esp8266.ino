#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// ===== WIFI =====
const char* ssid = "Na";
const char* password = "01042005";

// ===== MQTT =====
const char* mqtt_server = "172.20.10.3";
const int mqtt_port = 1884;
const char* mqtt_user = "";
const char* mqtt_pass = "";

// ===== CAM BIEN =====
#define DHTPIN D5
#define DHTTYPE DHT11
#define LIGHT_PIN A0

DHT dht(DHTPIN, DHTTYPE);

// ===== LED =====
#define LED1_PIN D6
#define LED2_PIN D7
#define LED3_PIN D8

const char* device_id = "esp8266_01";

// ===== MQTT CLIENT =====
WiFiClient espClient;
PubSubClient client(espClient);

// ===== TOPIC DIEU KHIEN =====
const char* topicLed1 = "iot/esp8266_01/led1/set";
const char* topicLed2 = "iot/esp8266_01/led2/set";
const char* topicLed3 = "iot/esp8266_01/led3/set";
const char* topicAllLeds = "iot/esp8266_01/leds/set";

// ===== TOPIC LENH HELLO =====
const char* topicHelloCmd = "iot/esp8266_01/hello/set";  // gui lenh vao day
const char* topicTest = "iot/esp8266_01/test";           // ESP ban "hello" ra day

// ===== TOPIC TRANG THAI =====
const char* topicLed1Status = "iot/esp8266_01/led1/status";
const char* topicLed2Status = "iot/esp8266_01/led2/status";
const char* topicLed3Status = "iot/esp8266_01/led3/status";

// ===== TOPIC CAM BIEN =====
const char* topicSensors = "iot/esp8266_01/sensors";

// ===== KET NOI WIFI =====
void setup_wifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("Dang ket noi WiFi");

  int retry = 0;

  while (WiFi.status() != WL_CONNECTED && retry < 40) {
    delay(500);
    Serial.print(".");
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nDa ket noi WiFi!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nKhong ket noi duoc WiFi!");
  }
}

// ===== DANG KY MQTT VA KIEM TRA =====
bool subscribeTopic(const char* topic) {
  bool result = client.subscribe(topic);

  Serial.print(result ? "OK - Da subscribe: "
                      : "LOI - Subscribe that bai: ");
  Serial.println(topic);

  return result;
}

// ===== GUI TRANG THAI LED =====
void publishLedStatus() {
  if (!client.connected()) return;

  client.publish(
    topicLed1Status,
    digitalRead(LED1_PIN) == HIGH ? "ON" : "OFF",
    true
  );

  client.publish(
    topicLed2Status,
    digitalRead(LED2_PIN) == HIGH ? "ON" : "OFF",
    true
  );

  client.publish(
    topicLed3Status,
    digitalRead(LED3_PIN) == HIGH ? "ON" : "OFF",
    true
  );
}

// ===== DIEU KHIEN CA 3 LED =====
void controlAllLeds(const String& message) {
  if (message == "ON") {
    digitalWrite(LED1_PIN, HIGH);
    digitalWrite(LED2_PIN, HIGH);
    digitalWrite(LED3_PIN, HIGH);

    Serial.println("DA BAT CA 3 DEN LED!");
  } else if (message == "OFF") {
    digitalWrite(LED1_PIN, LOW);
    digitalWrite(LED2_PIN, LOW);
    digitalWrite(LED3_PIN, LOW);

    Serial.println("DA TAT CA 3 DEN LED!");
  } else {
    Serial.print("Lenh khong hop le: [");
    Serial.print(message);
    Serial.println("]. Chi chap nhan ON/OFF.");
    return;
  }

  publishLedStatus();
}

// ===== DIEU KHIEN TUNG LED =====
void controlLed(
  int pin,
  const char* ledName,
  const char* statusTopic,
  const String& message
) {
  if (message == "ON") {
    digitalWrite(pin, HIGH);
    client.publish(statusTopic, "ON", true);

    Serial.print(ledName);
    Serial.println(" DA BAT");
  } else if (message == "OFF") {
    digitalWrite(pin, LOW);
    client.publish(statusTopic, "OFF", true);

    Serial.print(ledName);
    Serial.println(" DA TAT");
  } else {
    Serial.println("Lenh khong hop le! Chi chap nhan ON/OFF.");
  }
}

// ===== BAN CHU HELLO =====
void sendHello() {
  if (client.publish(topicTest, "hello")) {
    Serial.println("Da ban chu hello!");
  } else {
    Serial.println("Ban chu hello that bai!");
  }
}

// ===== NHAN LENH MQTT =====
void callback(
  char* topic,
  byte* payload,
  unsigned int length
) {
  String topicStr = String(topic);
  String message;
  message.reserve(length);

  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  message.trim();
  message.toUpperCase();

  Serial.print("Topic: ");
  Serial.println(topicStr);
  Serial.print("Payload: ");
  Serial.println(message);

  if (topicStr == topicAllLeds) {
    controlAllLeds(message);
  } else if (topicStr == topicLed1) {
    controlLed(
      LED1_PIN, "LED1 D6",
      topicLed1Status, message
    );
  } else if (topicStr == topicLed2) {
    controlLed(
      LED2_PIN, "LED2 D7",
      topicLed2Status, message
    );
  } else if (topicStr == topicLed3) {
    controlLed(
      LED3_PIN, "LED3 D8",
      topicLed3Status, message
    );
  } else if (topicStr == topicHelloCmd) {
    sendHello();  
  } else {
    Serial.println("Topic khong hop le!");
  }

  Serial.println("====================================");
}

// ===== KET NOI LAI MQTT =====
void reconnect_mqtt() {
  while (!client.connected()) {
    if (WiFi.status() != WL_CONNECTED) {
      return;
    }

    Serial.println("Dang ket noi MQTT...");

    String clientId = "ESP8266-";
    clientId += device_id;

    bool connected;

    if (strlen(mqtt_user) == 0) {
      connected = client.connect(clientId.c_str());
    } else {
      connected = client.connect(
        clientId.c_str(),
        mqtt_user,
        mqtt_pass
      );
    }

    if (connected) {
      Serial.println("Ket noi MQTT thanh cong!");

      // Dang ky tung topic va in ket qua
      bool sub1 = subscribeTopic(topicLed1);
      bool sub2 = subscribeTopic(topicLed2);
      bool sub3 = subscribeTopic(topicLed3);
      bool subAll = subscribeTopic(topicAllLeds);
      bool subHello = subscribeTopic(topicHelloCmd);

      if (sub1 && sub2 && sub3 && subAll && subHello) {
        Serial.println("DA DANG KY DU 5 TOPIC DIEU KHIEN!");
      } else {
        Serial.println("CAN KIEM TRA LAI TOPIC MQTT!");
      }

      publishLedStatus();
    } else {
      Serial.print("Ket noi MQTT that bai, rc=");
      Serial.println(client.state());
      delay(3000);
    }
  }
}

// ===== SETUP =====
void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  pinMode(LED3_PIN, OUTPUT);

  // Tat LED khi khoi dong
  digitalWrite(LED1_PIN, LOW);
  digitalWrite(LED2_PIN, LOW);
  digitalWrite(LED3_PIN, LOW);

  dht.begin();

  setup_wifi();

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  client.setBufferSize(512);
}

// ===== LOOP =====
void loop() {
  // Thu ket noi lai WiFi khi mat ket noi
  if (WiFi.status() != WL_CONNECTED) {
    static unsigned long lastWifiRetry = 0;

    if (millis() - lastWifiRetry >= 5000) {
      lastWifiRetry = millis();
      setup_wifi();
    }

    return;
  }

  // Ket noi lai MQTT
  if (!client.connected()) {
    reconnect_mqtt();
  }

  // Xu ly MQTT lien tuc
  client.loop();

  // Doc cam bien moi 3 giay
  static unsigned long lastMsg = 0;

  if (millis() - lastMsg >= 3000) {
    lastMsg = millis();

    float temp = dht.readTemperature();
    float hum = dht.readHumidity();
    int light = analogRead(LIGHT_PIN);

    if (isnan(temp) || isnan(hum)) {
      Serial.println("Doc DHT11 that bai!");
      return;
    }

    String payload =
      "{\"temperature\":" + String(temp, 1) +
      ",\"humidity\":" + String(hum, 1) +
      ",\"light\":" + String(light) + "}";

    if (client.publish(topicSensors, payload.c_str())) {
      Serial.println("Da gui du lieu cam bien:");
      Serial.println(payload);
    } else {
      Serial.println("Gui du lieu cam bien that bai!");
    }
  }
}

