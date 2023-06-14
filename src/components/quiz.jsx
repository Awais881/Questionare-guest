
import React, { useState, useEffect , useContext} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './quiz.css'; // Import the CSS file for styling
import { GlobalContext } from '../context/context';
const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [score, setScore] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const timeLimit = 300; // Time limit in seconds (3 minutes)
  const [totalQuestions, setTotalQuestions] = useState(0);

  const { state, dispatch } = useContext(GlobalContext);
  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timerStarted && !isTimeUp) {
        setTimer((prevTimer) => prevTimer + 1);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [timerStarted, isTimeUp]);

  useEffect(() => {
    if (timer >= timeLimit) {
      setIsTimeUp(true);
      submitAnswers();
    }
  }, [timer]);

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-right',
    iconColor: 'white',
    customClass: {
      popup: 'colored-toast'
    },
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true
  });

  const fetchQuestions = async () => {
    try {
    
      const response = await axios.get(`https://real-pear-badger-sock.cyclic.app/api/random-question?num=4`);
      const fetchedQuestions = response.data.questions;
      setQuestions(fetchedQuestions);
      setTotalQuestions(fetchedQuestions.length);
      console.log(response);
      setAnswers({});
    } catch (error) {
      console.error(error);
    }
  };

  const handleAnswerChange = (questionId, inputIndex, event) => {
    const { value } = event.target;
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: {
        ...(prevAnswers[questionId] || {}),
        [inputIndex]: value
      }
    }));
  };

  const startTimer = () => {
    setTimer(0);
    setTimerStarted(true);
  };

  const stopTimer = () => {
    setTimerStarted(false);
    setIsTimeUp(false);
  };

  const submitAnswers = async () => {
    try {
      // Stop the timer
      stopTimer();
      if (Object.keys(answers).length === 0) {
        Toast.fire({
          icon: 'error',
          title: 'Please provide at least one answer'
        });
        return;
      }
      const response = await axios.post(`https://real-pear-badger-sock.cyclic.app/api/submit-answers`, { answers });
      // const response = await axios.post("https://localhost:5001/api/submit-answers", { answers });


      Toast.fire({
        icon: 'success',
        title: response.data.message
      });

      // Update the score
      setScore(response.data.message);
    } catch (error) {
      Toast.fire({
        icon: 'error',
        title: 'Failed to submit answers'
      });
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setTimer(0);
    setScore(null);
    setCurrentQuestionIndex(0);
    setIsTimeUp(false);
    setTimerStarted(false);
  };

  const formatTime = (time) => {
    const totalSeconds = timeLimit - time;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setIsTimeUp(true);
      submitAnswers();
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
      <div className="quiz-container">
       
        {!timerStarted && !isTimeUp && score == null && currentQuestionIndex === 0 && (
            <div className='main-div'>   <p className='tittle'>Test Your</p>
            <h2>Knowledge</h2>
            <button className="quiz-start" onClick={startTimer}>Let's Start</button>
            </div>
        )}
        {timerStarted && !isTimeUp && (
          <>
          <div className='input-container'>
            <div className='box'>
            <div className="question-count">
        Question {currentQuestionIndex + 1}/{totalQuestions}
      </div>
            <div className="timer">{formatTime(timer)}</div>
            {/* <div className="question-item"> */}
              <p className="question-text">{currentQuestion.question}</p>
              </div>
              <div className="answer-inputs">
                <input
                  type="text"
                  className="answer-input"
                  placeholder="Min"
                  value={answers[currentQuestion.id]?.min || ''}
                  onChange={(event) => handleAnswerChange(currentQuestion.id, 'min', event)}
                />
                <input
                  type="text"
                  className="answer-input"
                  required
                  placeholder="Max"
                  value={answers[currentQuestion.id]?.max || ''}
                  onChange={(event) => handleAnswerChange(currentQuestion.id, 'max', event)}
                />
              </div>
            </div>
        
            {currentQuestionIndex === questions.length - 1 ? (
              <button className="quiz-button" onClick={submitAnswers} disabled={!Object.keys(answers).length}>
                Submit
              </button>
            ) : (
              <button className="quiz-button" onClick={nextQuestion} disabled={!Object.keys(answers).length}>Next</button>
            )}
           
          </>
        )}
        {isTimeUp && (
          <div>
            <p>Time's up! Submitting answers...</p>
            <button className="quiz-button" onClick={submitAnswers} disabled={!Object.keys(answers).length}>
              Submit
            </button>
          </div>
        )}
        {!timerStarted && isTimeUp && (
          <div>
            <p>Time's up! You can no longer submit answers.</p>
          </div>
        )}
        {timerStarted && isTimeUp && <button className="quiz-button" onClick={stopTimer}>Back</button>}
        {!timerStarted && isTimeUp && <button className="quiz-button" onClick={stopTimer}>Back</button>}
        {score !== null && (
          <div>
            <p>{score}</p>
            <button className="quiz-button" onClick={resetQuiz}>Attempt again</button>
          </div>
        )}


      

      </div>
    </>
  );
};

export default Quiz;



