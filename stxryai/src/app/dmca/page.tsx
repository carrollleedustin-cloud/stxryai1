'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Mail, FileText } from 'lucide-react';

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">DMCA Policy</h1>
          <p className="text-xl text-gray-300">
            Digital Millennium Copyright Act Notice and Takedown Procedure
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 space-y-6 text-gray-300"
        >
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Copyright Protection</h2>
            <p>
              StxryAI respects the intellectual property rights of others and expects our users to do the same.
              In accordance with the Digital Millennium Copyright Act (DMCA), we will respond to clear notices
              of alleged copyright infringement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Filing a DMCA Takedown Notice</h2>
            <p className="mb-4">
              If you believe that content on StxryAI infringes your copyright, please provide the following information:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Identification of the copyrighted work claimed to have been infringed</li>
              <li>Identification of the material that is claimed to be infringing</li>
              <li>Your contact information (name, address, phone, email)</li>
              <li>A statement that you have a good faith belief that use of the material is not authorized</li>
              <li>A statement that the information is accurate and you are authorized to act on behalf of the copyright owner</li>
              <li>Your physical or electronic signature</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-purple-400 mt-1" />
                <div>
                  <p className="text-white font-semibold mb-2">DMCA Agent</p>
                  <p className="text-gray-300">Email: dmca@stxryai.com</p>
                  <p className="text-gray-300 mt-2">
                    Please include "DMCA Takedown Request" in the subject line.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Counter-Notification</h2>
            <p>
              If you believe your content was removed in error, you may file a counter-notification.
              Please include the same information as above, plus a statement under penalty of perjury
              that you have a good faith belief the material was removed by mistake.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Repeat Infringers</h2>
            <p>
              StxryAI reserves the right to terminate accounts of users who are repeat copyright infringers
              in appropriate circumstances.
            </p>
          </section>

          <div className="pt-6 border-t border-white/10">
            <Link
              href="/contact?subject=DMCA Inquiry"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              <FileText className="w-5 h-5" />
              Contact DMCA Agent
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

