import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, ProgressBar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import styled from "styled-components";
import { aboutYouQuestions, aboutGamesQuestions } from "../quizData";
import { useAudio } from "../components/AudioManager";

const Wrapper = styled.div`
  width: 100%;
  min-height: 98vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  padding: 20px;
`;

const Title = styled.div`
  font-size: 30px;
  width: auto;
  max-width: 80%;
  text-align: center;
  margin-bottom: 20px;
  padding: 16px;
  border-bottom: 1px solid;
  border-radius: 8px;
  @media screen and (max-width: 768px) {
    font-size: 24px;
    width: 90%;
  }
`;

const MediaContainer = styled.div`
  margin: 20px 0;
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: center;
  align-items: center;

  img,
  video {
    max-width: 100%;
    max-height: 300px;
    border-radius: 10px;
    object-fit: contain;
  }

  audio {
    width: 100%;
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 500px;
`;

const OptionButton = styled(Button)`
  padding: 15px;
  font-size: 18px;
  text-align: left;
  position: relative;
  background-color: ${(props) => {
    if (props.$selected) {
      if (props.$correct) return "#28a745";
      return "#dc3545";
    }
    return props.$category === "aboutYou" ? "#007bff" : "#e74c3c";
  }};
  border-color: ${(props) => {
    if (props.$selected) {
      if (props.$correct) return "#28a745";
      return "#dc3545";
    }
    return props.$category === "aboutYou" ? "#007bff" : "#e74c3c";
  }};
  opacity: ${(props) =>
    !props.$selected && props.$showAnswer && !props.$correct ? 0.7 : 1};

  &:after {
    content: ${(props) =>
      props.$selected && props.$correct
        ? "✓"
        : props.$selected && !props.$correct
        ? "✗"
        : ""};
    position: absolute;
    right: 15px;
    font-size: 20px;
    font-weight: bold;
  }

  &:hover {
    background-color: ${(props) => {
      if (props.$selected) {
        if (props.$correct) return "#218838";
        return "#c82333";
      }
      return props.$category === "aboutYou" ? "#0069d9" : "#c0392b";
    }};
    border-color: ${(props) => {
      if (props.$selected) {
        if (props.$correct) return "#1e7e34";
        return "#bd2130";
      }
      return props.$category === "aboutYou" ? "#0062cc" : "#a63125";
    }};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: ${(props) => (props.$correct && props.$showAnswer ? 1 : 0.7)};
    background-color: ${(props) => {
      if (props.$correct && props.$showAnswer) return "#28a745";
      if (props.$selected) {
        if (props.$correct) return "#28a745";
        return "#dc3545";
      }
      return "#6c757d";
    }};
    border-color: ${(props) => {
      if (props.$correct && props.$showAnswer) return "#28a745";
      if (props.$selected) {
        if (props.$correct) return "#28a745";
        return "#dc3545";
      }
      return "#6c757d";
    }};
  }
`;

const NextButton = styled(Button)`
  margin-top: 20px;
  padding: 12px 24px;
  font-size: 18px;
`;

const ScoreDisplay = styled.div`
  font-size: 24px;
  margin: 20px 0;
  color: white;
`;

const CategoryBadge = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: ${(props) =>
    props.$category === "aboutYou" ? "#3498db" : "#e74c3c"};
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
  z-index: 100;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const Question = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category || "aboutYou";
  const { playSound } = useAudio();

  const [questionData, setQuestionData] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  useEffect(() => {
    // Set the appropriate questions based on category
    setQuestionData(
      category === "aboutGames" ? aboutGamesQuestions : aboutYouQuestions
    );
  }, [category]);

  const handleOptionSelect = (optionId) => {
    if (showAnswer) return; // Prevent selecting after answer is shown

    const currentQuestion = questionData[currentQuestionIndex];
    setSelectedOption(optionId);
    setShowAnswer(true);

    if (optionId === currentQuestion.correctAnswer) {
      // Correct answer
      setScore(score + 1);
      playSound("correct");
    } else {
      // Incorrect answer
      const newIncorrectCount = incorrectCount + 1;
      setIncorrectCount(newIncorrectCount);

      // Play special sound if too many incorrect answers
      if (newIncorrectCount >= 3) {
        playSound("special_incorrect");
      } else {
        playSound("incorrect");
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questionData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else {
      // Quiz is complete, navigate to result page
      navigate("/result", {
        state: { score, totalQuestions: questionData.length, category },
      });
    }
  };

  if (questionData.length === 0) {
    return <div>Loading...</div>;
  }

  const currentQuestion = questionData[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionData.length) * 100;

  return (
    <>
      <ProgressBar
        variant={category === "aboutYou" ? "info" : "danger"}
        now={progress}
        label={`${Math.round(progress)}%`}
      />
      <CategoryBadge $category={category}>
        {category === "aboutYou" ? "나에 대해서" : "게임에 대해서"}
      </CategoryBadge>
      <Wrapper>
        <ScoreDisplay>점수: {score} / 10</ScoreDisplay>

        <Title>{currentQuestion.title}</Title>

        {/* Render media based on type */}
        {currentQuestion.type !== "text" && (
          <MediaContainer>
            {currentQuestion.type === "image" && (
              <img src={currentQuestion.mediaPath} alt="Question" />
            )}
            {currentQuestion.type === "audio" && (
              <audio controls>
                <source src={currentQuestion.mediaPath} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
            {currentQuestion.type === "video" && (
              <video controls>
                <source src={currentQuestion.mediaPath} type="video/mp4" />
                Your browser does not support the video element.
              </video>
            )}
          </MediaContainer>
        )}

        <OptionsContainer>
          {currentQuestion.options.map((option) => (
            <OptionButton
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              $category={category}
              $selected={selectedOption === option.id}
              $correct={option.id === currentQuestion.correctAnswer}
              $showAnswer={showAnswer}
              disabled={showAnswer}
            >
              {option.text}
            </OptionButton>
          ))}
        </OptionsContainer>

        {showAnswer && (
          <NextButton
            variant={category === "aboutYou" ? "success" : "danger"}
            onClick={handleNextQuestion}
          >
            {currentQuestionIndex < questionData.length - 1
              ? "다음 문제"
              : "결과 보기"}
          </NextButton>
        )}
      </Wrapper>
    </>
  );
};

export default Question;
