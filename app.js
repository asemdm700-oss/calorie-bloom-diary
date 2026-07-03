const foodDatabase = {
  "овсянка": { calories: 370, protein: 13, fat: 7, carbs: 60 },
  "гречка вареная": { calories: 110, protein: 4, fat: 1, carbs: 21 },
  "рис вареный": { calories: 116, protein: 3, fat: 0, carbs: 26 },
  "куриная грудка": { calories: 165, protein: 31, fat: 4, carbs: 0 },
  "яйцо": { calories: 157, protein: 13, fat: 11, carbs: 1 },
  "творог 5%": { calories: 121, protein: 17, fat: 5, carbs: 2 },
  "йогурт греческий": { calories: 73, protein: 10, fat: 2, carbs: 4 },
  "молоко 2.5%": { calories: 52, protein: 3, fat: 3, carbs: 5 },
  "банан": { calories: 89, protein: 1, fat: 0, carbs: 23 },
  "яблоко": { calories: 52, protein: 0, fat: 0, carbs: 14 },
  "апельсин": { calories: 47, protein: 1, fat: 0, carbs: 12 },
  "авокадо": { calories: 160, protein: 2, fat: 15, carbs: 9 },
  "огурец": { calories: 15, protein: 1, fat: 0, carbs: 4 },
  "помидор": { calories: 18, protein: 1, fat: 0, carbs: 4 },
  "картофель вареный": { calories: 87, protein: 2, fat: 0, carbs: 20 },
  "лосось": { calories: 208, protein: 20, fat: 13, carbs: 0 },
  "тунец": { calories: 132, protein: 28, fat: 1, carbs: 0 },
  "сыр": { calories: 350, protein: 25, fat: 27, carbs: 2 },
  "хлеб цельнозерновой": { calories: 247, protein: 13, fat: 4, carbs: 41 },
  "оливковое масло": { calories: 884, protein: 0, fat: 100, carbs: 0 },
  "салат овощной": { calories: 45, protein: 2, fat: 2, carbs: 6 },
  "суп куриный": { calories: 55, protein: 5, fat: 2, carbs: 4 },
  "борщ": { calories: 57, protein: 3, fat: 3, carbs: 5 },
  "паста вареная": { calories: 131, protein: 5, fat: 1, carbs: 25 }
};

const metDatabase = {
  "ходьба": 3.5,
  "бег": 8.3,
  "силовая": 5,
  "йога": 2.5,
  "танцы": 5,
  "велосипед": 6.8,
  "плавание": 6,
  "пилатес": 3,
  "растяжка": 2.3,
  "домашняя тренировка": 4.5
};

const state = {
  foods: [],
  workouts: [],
  pendingFoodName: "",
  awaitingWeight: false
};

const elements = {
  chatLog: document.querySelector("#chatLog"),
  chatForm: document.querySelector("#chatForm"),
  chatInput: document.querySelector("#chatInput"),
  foodForm: document.querySelector("#foodForm"),
  foodSelect: document.querySelector("#foodSelect"),
  foodWeight: document.querySelector("#foodWeight"),
  workoutForm: document.querySelector("#workoutForm"),
  activitySelect: document.querySelector("#activitySelect"),
  workoutMinutes: document.querySelector("#workoutMinutes"),
  userWeight: document.querySelector("#userWeight"),
  clearDay: document.querySelector("#clearDay"),
  normForm: document.querySelector("#normForm"),
  normResult: document.querySelector("#normResult"),
  normWeight: document.querySelector("#normWeight"),
  normHeight: document.querySelector("#normHeight"),
  normAge: document.querySelector("#normAge"),
  activityFactor: document.querySelector("#activityFactor")
};

function round(value) {
  return Math.round(Number(value) || 0);
}

function calculateFood(name, grams) {
  const item = foodDatabase[name];
  const factor = grams / 100;
  return {
    name,
    grams,
    calories: round(item.calories * factor),
    protein: round(item.protein * factor),
    fat: round(item.fat * factor),
    carbs: round(item.carbs * factor)
  };
}

function calculateWorkout(activity, minutes, weight) {
  const met = metDatabase[activity];
  const burned = met * weight * (minutes / 60);
  return {
    activity,
    minutes,
    weight,
    burned: round(burned)
  };
}

function totals() {
  const eaten = state.foods.reduce(
    (sum, food) => ({
      calories: sum.calories + food.calories,
      protein: sum.protein + food.protein,
      fat: sum.fat + food.fat,
      carbs: sum.carbs + food.carbs
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );
  const burned = state.workouts.reduce((sum, workout) => sum + workout.burned, 0);
  return { ...eaten, burned, balance: eaten.calories - burned };
}

function balanceText(balance) {
  if (balance > 100) {
    return "Сегодня ты немного превысила расход энергии. Это нормально. Завтра всегда можно скорректировать питание. 💕";
  }
  if (balance < -100) {
    return "Отличная работа! Сегодня ты сохранила дефицит калорий. 💪";
  }
  return "Прекрасный баланс! Так держать! ✨";
}

function updateSummary() {
  const total = totals();
  document.querySelector("#totalCalories").textContent = total.calories;
  document.querySelector("#totalProtein").textContent = total.protein;
  document.querySelector("#totalFat").textContent = total.fat;
  document.querySelector("#totalCarbs").textContent = total.carbs;
  document.querySelector("#totalBurned").textContent = `${total.burned} ккал`;
  document.querySelector("#balanceValue").textContent = `${total.balance} ккал`;
  document.querySelector("#balanceMessage").textContent = balanceText(total.balance);
  document.querySelector("#heroCalories").textContent = total.calories;
  document.querySelector("#heroBurned").textContent = total.burned;
  document.querySelector("#heroBalance").textContent = total.balance;
}

function addMessage(text, sender = "bot") {
  const message = document.createElement("div");
  message.className = `message message--${sender}`;
  message.textContent = text;
  elements.chatLog.append(message);
  elements.chatLog.scrollTop = elements.chatLog.scrollHeight;
}

function foodResponse(food) {
  return `🍽 Прием пищи

${food.name}, ${food.grams} г
• Калории — ${food.calories} ккал
• Белки — ${food.protein} г
• Жиры — ${food.fat} г
• Углеводы — ${food.carbs} г

Добавить еще продукт? Ты отлично справляешься 🌸`;
}

function workoutResponse(workout) {
  return `🏃 Тренировка

${workout.activity}
Время — ${workout.minutes} мин
Потрачено — ${workout.burned} ккал

Супер, ты позаботилась о себе 💪`;
}

function diaryResponse() {
  if (!state.foods.length) {
    return "В дневнике пока нет продуктов. Напиши, что ты сегодня съела, и я помогу посчитать 🍎";
  }
  return `🍽 Мой дневник

${state.foods
  .map((food, index) => `${index + 1}. ${food.name}, ${food.grams} г — ${food.calories} ккал, Б ${food.protein} г, Ж ${food.fat} г, У ${food.carbs} г`)
  .join("\n")}

Все идет хорошо, маленькие шаги тоже считаются ✨`;
}

function progressResponse() {
  const total = totals();
  return `📊 Мой прогресс

• Калории — ${total.calories} ккал
• Белки — ${total.protein} г
• Жиры — ${total.fat} г
• Углеводы — ${total.carbs} г
• Тренировок — ${state.workouts.length}
• Потрачено — ${total.burned} ккал
• Баланс — ${total.balance} ккал

${balanceText(total.balance)}`;
}

function clearDay() {
  state.foods = [];
  state.workouts = [];
  state.pendingFoodName = "";
  state.awaitingWeight = false;
  updateSummary();
}

function normalize(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseWeight(text) {
  const match = text.replace(",", ".").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function findFoodName(text) {
  const normalized = normalize(text);
  return Object.keys(foodDatabase).find((name) => normalized.includes(name));
}

function handleCommand(command) {
  const normalized = normalize(command);

  if (normalized === "мой дневник") {
    addMessage(diaryResponse());
    return true;
  }

  if (normalized === "мой прогресс") {
    addMessage(progressResponse());
    return true;
  }

  if (normalized === "очистить") {
    clearDay();
    addMessage("День очищен. Начинаем заново спокойно и без давления 🌸");
    return true;
  }

  if (normalized === "удали последний продукт") {
    const removed = state.foods.pop();
    updateSummary();
    addMessage(removed ? `Удалила: ${removed.name}. Дневник обновлен 💕` : "Пока нечего удалять, дневник пустой 🍎");
    return true;
  }

  return false;
}

function handleChat(text) {
  addMessage(text, "user");

  if (handleCommand(text)) return;

  if (state.awaitingWeight && state.pendingFoodName) {
    const grams = parseWeight(text);
    if (!grams) {
      addMessage("Подскажи хотя бы примерную порцию в граммах или штуках. Можно очень приблизительно 🌸");
      return;
    }
    const food = calculateFood(state.pendingFoodName, grams);
    state.foods.push(food);
    state.pendingFoodName = "";
    state.awaitingWeight = false;
    updateSummary();
    addMessage(foodResponse(food));
    return;
  }

  const foodName = findFoodName(text);
  const grams = parseWeight(text);

  if (foodName && grams) {
    const food = calculateFood(foodName, grams);
    state.foods.push(food);
    updateSummary();
    addMessage(foodResponse(food));
    return;
  }

  if (foodName) {
    state.pendingFoodName = foodName;
    state.awaitingWeight = true;
    addMessage("Сколько граммов была порция? Если не знаешь точно, напиши примерную оценку 🌸");
    return;
  }

  addMessage("Я пока не нашла этот продукт в базе и не хочу придумывать калорийность. Выбери продукт из формы или уточни пищевую ценность на 100 г 🍎");
}

function populateSelects() {
  Object.keys(foodDatabase).forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    elements.foodSelect.append(option);
  });

  Object.keys(metDatabase).forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    elements.activitySelect.append(option);
  });
}

elements.chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = elements.chatInput.value.trim();
  if (!text) return;
  elements.chatInput.value = "";
  handleChat(text);
});

elements.foodForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const food = calculateFood(elements.foodSelect.value, Number(elements.foodWeight.value));
  state.foods.push(food);
  updateSummary();
  addMessage(foodResponse(food));
});

elements.workoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const workout = calculateWorkout(
    elements.activitySelect.value,
    Number(elements.workoutMinutes.value),
    Number(elements.userWeight.value)
  );
  state.workouts.push(workout);
  updateSummary();
  addMessage(workoutResponse(workout));
});

elements.normForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const weight = Number(elements.normWeight.value);
  const height = Number(elements.normHeight.value);
  const age = Number(elements.normAge.value);
  const factor = Number(elements.activityFactor.value);
  const bmr = round(10 * weight + 6.25 * height - 5 * age - 161);
  const maintenance = round(bmr * factor);
  const deficit = round(maintenance * 0.85);
  const surplus = round(maintenance * 1.12);

  elements.normResult.classList.add("is-visible");
  elements.normResult.textContent = `BMR — ${bmr} ккал
Поддержание веса — ${maintenance} ккал
Для похудения — около ${deficit} ккал
Для набора массы — около ${surplus} ккал

Рекомендация мягкая: дефицит 10–20% или профицит 10–15%. Без экстремально низкой калорийности 💕`;
});

elements.clearDay.addEventListener("click", () => {
  clearDay();
  addMessage("День очищен. Можно начать заново с чистого листа 🌸");
});

document.querySelectorAll("[data-command]").forEach((button) => {
  button.addEventListener("click", () => handleChat(button.dataset.command));
});

populateSelects();
updateSummary();
addMessage("Привет! 🌸 Я помогу тебе посчитать калории, белки, жиры, углеводы и определить баланс за день. Начнем?");
