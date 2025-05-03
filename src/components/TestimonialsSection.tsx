"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    rating: 5,
    title: "Very helpful service!",
    text: "My husband and I moved out of a rented apartment, the owners did not want to break the contract. Nightmare hosts got caught. Needed money urgently hob. Night in the yard! At Ubuntu Loan, my husband sent a request, and got approved fast.",
    author: "Jessica",
    date: "01/04"
  },
  {
    rating: 5,
    title: "Thank you, you help out",
    text: "I always use the services of your company. It's a pleasure to work with you. Completely satisfied with the level of service.",
    author: "Anna",
    date: "02/04"
  },
  {
    rating: 5,
    title: "Fast and reliable",
    text: "The process was incredibly simple. I was approved within hours and had the money in my account the next day. Couldn't be happier with the service!",
    author: "John",
    date: "03/04"
  }
];

export default function TestimonialsSection() {
  return (
    <motion.section 
      className="py-16 bg-black"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
        >
          What people say about us
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <motion.div 
              key={index}
              className="bg-gray-800 p-8 rounded-lg"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-[#fccf03] flex">
                  {[...Array(item.rating)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-500">{item.date}</span>
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-400 mb-6 italic">"{item.text}"</p>
              <div className="mt-auto">
                <h4 className="font-semibold">{item.author}</h4>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-center mt-8 gap-4">
          <motion.button 
            className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1, backgroundColor: "#4B5563" }}
            whileTap={{ scale: 0.9 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
          <motion.button 
            className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1, backgroundColor: "#4B5563" }}
            whileTap={{ scale: 0.9 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
} 