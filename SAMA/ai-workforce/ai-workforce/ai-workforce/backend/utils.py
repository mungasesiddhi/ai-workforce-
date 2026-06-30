import joblib

model = joblib.load("model.pkl")

def full_prediction(ai, coding, communication):
    input_data = [[ai, coding, communication]]
    prediction = model.predict(input_data)[0]

    return {
        "career": prediction,
        "ai_score": ai,
        "coding_score": coding,
        "communication_score": communication
    }