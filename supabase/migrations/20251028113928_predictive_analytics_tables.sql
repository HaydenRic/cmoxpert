/*
  # Predictive Analytics Tables

  ## Overview
  Storage for AI-powered predictions and optimization recommendations.

  ## New Tables

  ### 1. `campaign_predictions` - Revenue and conversion forecasts
  ### 2. `optimization_recommendations` - AI-generated budget allocation suggestions

  ## Security
  - RLS enabled
  - User-scoped access
*/

-- =====================================================
-- 1. CAMPAIGN PREDICTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS campaign_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,

  -- Prediction metadata
  prediction_date date NOT NULL,
  forecast_horizon_days integer DEFAULT 30,
  model_type text DEFAULT 'linear_regression' CHECK (model_type IN (
    'linear_regression', 'time_series', 'arima', 'prophet', 'ml_ensemble'
  )),
  confidence_score decimal(3,2),

  -- Predictions data
  predictions jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Aggregated metrics
  total_predicted_spend decimal(12,2),
  total_predicted_revenue decimal(12,2),
  predicted_roas decimal(5,2),

  -- Model performance
  mae decimal(10,2),
  rmse decimal(10,2),
  mape decimal(5,2),

  created_at timestamptz DEFAULT now(),

  UNIQUE(user_id, client_id, prediction_date)
);

CREATE INDEX IF NOT EXISTS idx_predictions_user ON campaign_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_client ON campaign_predictions(client_id);
CREATE INDEX IF NOT EXISTS idx_predictions_date ON campaign_predictions(prediction_date);

-- =====================================================
-- 2. OPTIMIZATION RECOMMENDATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS optimization_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,

  -- Recommendation details
  recommendation_date date NOT NULL,
  channel text NOT NULL,
  current_spend decimal(12,2) NOT NULL,
  recommended_spend decimal(12,2) NOT NULL,
  expected_revenue_increase decimal(12,2),
  confidence decimal(3,2),
  reasoning text,

  -- Status
  status text DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'rejected', 'implemented'
  )),
  implemented_at timestamptz,
  actual_result jsonb,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user ON optimization_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_client ON optimization_recommendations(client_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_channel ON optimization_recommendations(channel);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON optimization_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_date ON optimization_recommendations(recommendation_date);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE campaign_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_recommendations ENABLE ROW LEVEL SECURITY;

-- Campaign predictions policies
CREATE POLICY "Users can manage own predictions"
  ON campaign_predictions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Optimization recommendations policies
CREATE POLICY "Users can manage own recommendations"
  ON optimization_recommendations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
