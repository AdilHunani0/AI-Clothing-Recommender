import pandas as pd
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
import joblib

# Load dataset
df = pd.read_csv("expanded_outfit_dataset_with_id(in).csv", encoding="latin1")

# Updated feature columns
feature_cols = ["body_type", "skin_tone", "face_shape"]
target_cols = ["top", "bottom", "top_color", "bottom_color"]

# Save feature columns
joblib.dump(feature_cols, 'feature_columns.pkl')

# Train and save models
for target in target_cols:
    print(f"\n🔧 Training model for: {target}")

    label_counts = df[target].value_counts()
    valid_labels = label_counts[label_counts >= 2].index
    filtered_df = df[df[target].isin(valid_labels)]

    if filtered_df.empty:
        print(f"⚠️ Skipping {target}: Not enough data.")
        continue

    X = filtered_df[feature_cols]
    y = filtered_df[target]

    try:
        X_train, X_test, y_train_raw, y_test_raw = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
    except ValueError as e:
        print(f"❌ Skipping {target}: {e}")
        continue

    le = LabelEncoder()
    y_train = le.fit_transform(y_train_raw)
    y_test = le.transform(y_test_raw)

    preprocessor = ColumnTransformer([
        ('cat', OneHotEncoder(handle_unknown='ignore'), feature_cols)
    ])

    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=200, random_state=42))
    ])

    pipeline.fit(X_train, y_train)
    accuracy = pipeline.score(X_test, y_test)
    print(f"✅ Accuracy for {target}: {accuracy:.2f}")

    joblib.dump(pipeline, f"{target}_model.pkl")
    joblib.dump(le, f"{target}_encoder.pkl")

# Save models dictionary and dataset
models = {}
for target in target_cols:
    models[target] = {
        "pipeline": joblib.load(f"{target}_model.pkl"),
        "encoder": joblib.load(f"{target}_encoder.pkl")
    }
joblib.dump(models, 'models.pkl')
joblib.dump(df, 'dataset.pkl')
print("\n🎉 All models and dataset saved successfully.")