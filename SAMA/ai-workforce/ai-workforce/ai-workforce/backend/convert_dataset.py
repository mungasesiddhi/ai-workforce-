import pandas as pd
import numpy as np
import random

df = pd.read_csv("data/post_ai_career_dataset_5000.csv")
df.columns = df.columns.str.strip()

# Set a random seed for reproducible "noise"
np.random.seed(42)

# Group roles by their primary characteristic to assign base scores (out of 10)
# Format: (AI_Base, Coding_Base, Comm_Base)
role_profiles = {
    # AI Heavies
    "Prompt Engineer": (9.5, 6.0, 8.5),
    "Machine Learning Engineer": (9.0, 9.0, 6.5),
    "AI Ethics Specialist": (8.5, 5.0, 9.5),
    "AI Product Manager": (8.0, 6.0, 9.5),
    "Data Scientist": (8.5, 8.0, 7.5),
    "Computer Vision Engineer": (9.0, 8.5, 6.0),
    "NLP Engineer": (9.0, 8.5, 7.0),
    
    # Coding Heavies
    "Software Engineer": (5.0, 9.5, 7.0),
    "Backend Developer": (4.5, 9.5, 6.0),
    "Frontend Developer": (4.0, 9.0, 7.5),
    "Full Stack Developer": (5.0, 9.5, 7.5),
    "Cloud Architect": (6.5, 8.5, 8.0),
    "DevOps Engineer": (6.0, 8.5, 7.0),
    "Platform Engineer": (5.5, 9.0, 7.0),
    "Security Analyst": (6.0, 7.5, 7.5),
    "Penetration Tester": (5.5, 8.5, 6.5),
    "Blockchain Developer": (5.0, 9.0, 6.0),
    "Game Developer": (6.0, 9.0, 7.0),

    # Comm/Business Heavies
    "Business Intelligence Analyst": (6.5, 6.5, 9.0),
    "Product Manager": (6.0, 5.0, 9.5),
    "UX/UI Designer": (5.0, 6.0, 8.5),
    "Technical Writer": (5.0, 5.0, 9.5),
    "Scrum Master": (4.0, 4.0, 9.5),
    "Data Analyst": (6.5, 7.0, 8.5),
    "Marketing Analytics Manager": (7.0, 5.0, 9.0),
    "Sales Engineer": (5.5, 6.5, 9.5),
    "Project Manager": (4.0, 4.0, 9.0)
}

# Fallback profile for unlisted roles: (5, 5, 5)
fallback = (5.0, 5.0, 5.0)

def generate_scores(row):
    role = str(row["Career_Role"]).strip()
    
    # Get base profile or fallback
    base_ai, base_coding, base_comm = role_profiles.get(role, fallback)
    
    # Add random noise (-1 to +1) to create variety in the dataset
    # keeping values bounded between 1 and 10
    ai_score = max(1.0, min(10.0, base_ai + np.random.uniform(-1.0, 1.0)))
    coding_score = max(1.0, min(10.0, base_coding + np.random.uniform(-1.0, 1.0)))
    comm_score = max(1.0, min(10.0, base_comm + np.random.uniform(-1.0, 1.0)))
    
    return round(ai_score, 1), round(coding_score, 1), round(comm_score, 1)

# Apply the logic
scores = df.apply(generate_scores, axis=1)
df["AI_Skill"] = [s[0] for s in scores]
df["Coding_Skill"] = [s[1] for s in scores]
df["Communication_Skill"] = [s[2] for s in scores]
df["Career"] = df["Career_Role"]

# Final Dataset
clean_df = df[["AI_Skill", "Coding_Skill", "Communication_Skill", "Career"]]
clean_df.to_csv("data/clean_dataset.csv", index=False)

print("✅ Clean dataset created successfully with dynamic continuous scores!")