import { useScore } from '../contexts/ScoreContext';

const ScoreDisplay = () => {
  const { scoreData, isLoading } = useScore();

  if (isLoading) {
    return (
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-block',
            width: '20px',
            height: '20px',
            border: '2px solid #f3f3f3',
            borderTop: '2px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '10px', color: '#666' }}>Calculating scores...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!scoreData) {
    return null;
  }

  const { walkingScore, drivingScore, urbanSuburbanIndex } = scoreData;

  const getScoreColor = (score) => {
    if (score >= 80) return '#27ae60'; // Green
    if (score >= 60) return '#f39c12'; // Orange
    if (score >= 40) return '#e67e22'; // Dark orange
    return '#e74c3c'; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div style={{ 
      marginTop: '20px', 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        {/* Walking Score */}
        <div style={{ 
          padding: '15px', 
          backgroundColor: 'white', 
          borderRadius: '6px',
          border: '1px solid #e0e0e0'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#34495e' }}>🚶 Walking Score</h4>
          <div style={{ 
            fontSize: '2em', 
            fontWeight: 'bold', 
            color: getScoreColor(walkingScore),
            marginBottom: '5px'
          }}>
            {walkingScore}/100
          </div>
          <div style={{ 
            fontSize: '0.9em', 
            color: getScoreColor(walkingScore),
            fontWeight: '500'
          }}>
            {getScoreLabel(walkingScore)}
          </div>
          <div style={{ 
            fontSize: '0.8em', 
            color: '#7f8c8d', 
            marginTop: '5px'
          }}>
            Based on nearby amenities within 1km
          </div>
        </div>

        {/* Driving Score */}
        <div style={{ 
          padding: '15px', 
          backgroundColor: 'white', 
          borderRadius: '6px',
          border: '1px solid #e0e0e0'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#34495e' }}>🚗 Driving Score</h4>
          <div style={{ 
            fontSize: '2em', 
            fontWeight: 'bold', 
            color: getScoreColor(drivingScore),
            marginBottom: '5px'
          }}>
            {drivingScore}/100
          </div>
          <div style={{ 
            fontSize: '0.9em', 
            color: getScoreColor(drivingScore),
            fontWeight: '500'
          }}>
            {getScoreLabel(drivingScore)}
          </div>
          <div style={{ 
            fontSize: '0.8em', 
            color: '#7f8c8d', 
            marginTop: '5px'
          }}>
            Based on nearby amenities within 3km
          </div>
        </div>

        {/* Urban/Suburban Index */}
        <div style={{ 
          padding: '15px', 
          backgroundColor: 'white', 
          borderRadius: '6px',
          border: '1px solid #e0e0e0'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#34495e' }}>🏙️ Urban Density</h4>
          <div style={{ 
            fontSize: '2em', 
            fontWeight: 'bold', 
            color: getScoreColor(urbanSuburbanIndex.score),
            marginBottom: '5px'
          }}>
            {urbanSuburbanIndex.score}/100
          </div>
          <div style={{ 
            fontSize: '0.9em', 
            color: getScoreColor(urbanSuburbanIndex.score),
            fontWeight: '500'
          }}>
            {urbanSuburbanIndex.label}
          </div>
          <div style={{ 
            fontSize: '0.8em', 
            color: '#7f8c8d', 
            marginTop: '5px'
          }}>
            Based on street density and amenities
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: '15px', 
        padding: '10px', 
        backgroundColor: '#ecf0f1', 
        borderRadius: '4px',
        fontSize: '0.85em',
        color: '#2c3e50'
      }}>
        <strong>Note:</strong> Scores are calculated based on proximity to amenities like supermarkets, schools, hospitals, parks, restaurants, and bus stops. Higher scores indicate better accessibility and urban development.
      </div>
    </div>
  );
};

export default ScoreDisplay;
