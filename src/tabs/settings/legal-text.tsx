


// #region Imports

import React from 'react'; // What: React. Why: Both documents are React components. How: This is used directly for React.Fragment and the components' return type.

// #endregion Imports



/**
 * legal-text.tsx = Legal Text
 *
 * @summary
 * The Privacy Policy and Terms of Service themselves, each a component that
 * owns its document's full body copy and nothing else, so the text lives in
 * one place. The Settings modal renders them in its panel, and the build
 * renders them into the standalone /privacy and /terms pages, which load
 * them outside the browser, so this file imports only React.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region PriPolCom

/**
 * PriPolCom = Privacy Policy Component
 *
 * @summary
 * Renders the Privacy Policy's own body copy (a title, a run of
 * sections, subsections, paragraphs and lists) as a React.Fragment, so
 * the Settings modal and the standalone /privacy page can each drop it into
 * a body of their own.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props - This component does not use any props.
 *
 * @returns The policy's own document markup, wrapped in a Fragment.
 *
 * @example
 * ```tsx
 * PriPolCom({}) // => <PriPolCom />
 * ```
 *
*/

function PriPolCom () : React.JSX.Element {


	return (


		<React.Fragment>{ /* What: Container Fragment Element. Why: The document's own top-level elements need one wrapper so whichever container shows the document can render them as a single child, without adding an extra DOM node of its own. How: This wraps the policy's own heading, sections, and lists below. */ }


			<h1>Privacy Policy</h1>{ /* What: Document Title Heading Element. Why: This is the document's own top-level heading naming which legal document this is. How: This renders as a plain h1 at the top of the document body. */ }

			<p>Last updated: October 26, 2026</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>We use Your Personal Data to provide and improve the Service. We collect, use, and disclose Your information as described in this Privacy Policy and, where required by applicable law, only where We have a valid legal basis to do so, including Your consent (where consent is required). This Privacy Policy has been created with the help of the <a
				href='https://www.termsfeed.com/privacy-policy-generator/'
				rel='noopener noreferrer'
				target='_blank'
			>Privacy Policy Generator</a>{ /* What: Inline Generator Credit Link Element. Why: This credits the third-party generator this legal text was drafted with. How: This opens the linked generator page in a new tab. */ }.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Interpretation and Definitions</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<h3>Interpretation</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Definitions</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>For the purposes of this Privacy Policy:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }



			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Account</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means a unique account created for You to access Our Service or parts of Our Service.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Affiliate</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means an entity that controls, is controlled by, or is under common control with a party, where &quot;control&quot; means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Company</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Privacy Policy) refers to Ease My Life.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Country/State</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to: Missouri, United States.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Device</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means any device that can access the Service, such as a computer, a cell phone or a digital tablet.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Personal Data</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } (or &quot;Personal Information&quot;) is any information that relates to an identified or identifiable individual.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }

					<p>We use &quot;Personal Data&quot; and &quot;Personal Information&quot; interchangeably unless a law uses a specific term.</p>{ /* What: Labeled Fact Paragraph Element. Why: This states one plain labeled fact belonging to the list entry above it. How: This is plain static text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Service</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to the Website.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Service Provider</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, or to perform services related to the Service.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Usage Data</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>User</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means any individual who accesses or uses the Service.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Website</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to Ease My Life, accessible from <a
						href='https://www.easemylife.app'
						rel='external nofollow noopener noreferrer'
						target='_blank'
					>https://www.easemylife.app</a>{ /* What: Inline Site Link Element. Why: This points the reader at the app's own live website. How: This opens the site in a new tab. */ }.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>You</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


			</ul>



			<h2>Collecting and Using Your Personal Information</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<h3>Types of Data Collected</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<h4>Data That Stays on Your Device</h4>{ /* What: Sub-Subsection Heading Element. Why: This marks the start of a narrower subsection under the h3 above it. How: This renders as a plain h4, styled by the prose rules of whatever container it renders into. */ }

			<p>Everything You create in Ease My Life, including Your pickers, items, reminders, history, and settings, is stored in Your browser's own storage on Your Device. It is not sent to Us, and We cannot see it, unless You buy sync, as described under Accounts, Sync, and Payments. If You sign in, Your sign-in session is kept in the same storage. Clearing Your browser's data for the Website, or choosing Reset in Settings under Data control, removes it.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h4>Personal Data</h4>{ /* What: Sub-Subsection Heading Element. Why: This marks the start of a narrower subsection under the h3 above it. How: This renders as a plain h4, styled by the prose rules of whatever container it renders into. */ }

			<p>We collect Personal Data only in these cases:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li><strong>Your Account.</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ } If You sign in, Your email address and, if You sign in with Google, the basic profile details Google shares, as described under Accounts, Sync, and Payments.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li><strong>Purchases.</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ } If You buy sync, the email address and order details Polar shares with Us.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li><strong>Support requests.</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ } If You send a message through the support form in Settings, Your subject and message, along with the app version and Your browser's name and version, which the form adds so We can look into a problem. The form doesn't ask for Your name or email address, so include Your email address in Your message if You would like a reply.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li><strong>Emails You send Us.</strong>{ /* What: Lead-In Strong Element. Why: This bolds the short label a list item's own sentence continues after. How: This wraps the label text in a native strong tag for visual emphasis. */ } If You email Us, Your email address and anything Your message includes.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


			</ul>

			<h4>Usage Data</h4>{ /* What: Sub-Subsection Heading Element. Why: This marks the start of a narrower subsection under the h3 above it. How: This renders as a plain h4, styled by the prose rules of whatever container it renders into. */ }

			<p>The Service itself does not collect Usage Data. It contains no analytics, advertising, or tracking code. Like any website, the Website's hosting providers, Netlify and Cloudflare, receive technical information such as Your IP address and browser type when Your Device requests the Website's files, use it to deliver the Website and keep it secure, and may keep it in their server logs under their own policies.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h4>Cookies and Tracking</h4>{ /* What: Sub-Subsection Heading Element. Why: This marks the start of a narrower subsection under the h3 above it. How: This renders as a plain h4, styled by the prose rules of whatever container it renders into. */ }

			<p>The Service does not use cookies, web beacons, or any other tracking technology, and shows no ads. If You sign in with Google, Google may set its own cookies during sign-in, under Google's own privacy policy.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Use of Your Personal Data</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>We use the Personal Data described above only to:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li>Provide the Service, including signing You in and keeping Your devices in sync if You have bought sync.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Process Your purchase and unlock sync for Your Account.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Answer Your support requests and fix the problems You report.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Send the emails the Service needs, such as a sign-in link You ask for.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


			</ul>

			<p>We do not sell Your Personal Data, use it for advertising, or send marketing emails.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>We share Personal Data only with the Service Providers that run parts of the Service for Us, and only as far as each needs to do its job: Google Firebase for sign-in and the cloud copy, Polar for payments, which it processes through Stripe, and Netlify and Cloudflare for hosting and the support form. We may also disclose it with Your consent, or as described under Disclosure of Your Personal Data.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Retention of Your Personal Data</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>We keep Personal Data only as long as We need it:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li>Data on Your Device stays there until You delete it.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Your Account stays until You ask Us to delete it, and Your cloud copy stays until You delete it, as described under Deleting Your Cloud Copy.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Support messages and emails are kept only as long as needed to resolve Your request, and no longer than 24 months.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Polar keeps its own records of Your purchase, as the law requires for tax and accounting, under its own policies.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Netlify and Cloudflare keep their server logs under their own policies.</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


			</ul>

			<p>We may keep Personal Data longer where the law requires it, or to establish, exercise, or defend legal claims.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Transfer of Your Personal Data</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. This means that this information may be transferred to and maintained on computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ from those of Your jurisdiction.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Where required by applicable law, We will ensure that international transfers of Your Personal Data are subject to appropriate safeguards and, where relevant, supplementary measures. The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place, including the security of Your data and other personal information.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Delete Your Personal Data</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>You can delete everything stored on Your Device at any time by choosing Reset in Settings, under Data control. You can delete Your cloud copy as described under Deleting Your Cloud Copy. To delete Your Account, or any other Personal Data We hold, such as a support message, contact Us.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Please note, however, that We may need to retain certain information when We have a legal obligation or lawful basis to do so.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Disclosure of Your Personal Data</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<h4>Business Transactions</h4>{ /* What: Sub-Subsection Heading Element. Why: This marks the start of a narrower subsection under the h3 above it. How: This renders as a plain h4, styled by the prose rules of whatever container it renders into. */ }

			<p>If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h4>Law Enforcement</h4>{ /* What: Sub-Subsection Heading Element. Why: This marks the start of a narrower subsection under the h3 above it. How: This renders as a plain h4, styled by the prose rules of whatever container it renders into. */ }

			<p>Under certain circumstances, the Company may disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h4>Other Legal Requirements</h4>{ /* What: Sub-Subsection Heading Element. Why: This marks the start of a narrower subsection under the h3 above it. How: This renders as a plain h4, styled by the prose rules of whatever container it renders into. */ }

			<p>The Company may disclose Your Personal Data in the good-faith belief that such action is necessary to:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li>Comply with a legal obligation</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Protect and defend the rights or property of the Company</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Prevent or investigate possible wrongdoing in connection with the Service</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Protect the personal safety of Users of the Service or the public</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }

				<li>Protect against legal liability</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


			</ul>

			<h3>Security of Your Personal Data</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While We strive to use commercially reasonable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Accounts, Sync, and Payments</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>Ease My Life works without an account. Everything You create is stored on Your own device, and none of it is sent to Us unless You sign in and buy sync across devices.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Your Account</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>If You sign in, Your Account is managed by Google Firebase Authentication. It stores Your email address and, if You sign in with Google, the basic profile details Google shares, such as Your name. It also records whether You have bought sync. Signing in on its own sends none of Your Ease My Life data anywhere.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Your Cloud Copy</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>If You buy sync, a copy of Your Ease My Life data (Your pickers, items, reminders, conditionals, Today list, holidays, and history) is stored in Google Cloud Firestore, in data centers in the United States, so that Your other signed-in devices can download it. Your theme and display settings are not uploaded, and stay separate on each device.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Your cloud copy is encrypted while it travels between Your devices and Google, and Google encrypts it where it is stored. It is not end-to-end encrypted, so it is protected by Google's security and by access rules that let only Your own signed-in Account read or change it. We do not read, sell, or share Your data, and We use it only to keep Your devices in sync.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>We keep Your cloud copy for as long as Your Account has one, until You delete it.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Payments and Tips</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>Purchases are handled by Polar (polar.sh), which acts as the seller of record and processes payment through Stripe. We never see or store Your card details. Polar shares with Us the email address and order details needed to unlock sync for Your Account. Optional tips are handled by Ko-fi (ko-fi.com). The information You give Polar or Ko-fi is covered by their own privacy policies.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Deleting Your Cloud Copy</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>You can delete Your cloud copy at any time in Settings, under Data control, by choosing Reset and then Reset and delete cloud copy. That removes Your data from Firestore and signs the device out. A device that is still signed in to Your Account will upload its own data again the next time it syncs, so sign out of Your other devices first, or reset them too. Signing out keeps everything on the device. To delete Your Account itself, contact Us.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Children's and Minors' Privacy</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>The Service is meant for adults. It is not directed to anyone under the age of 18, and We do not knowingly collect Personal Information from anyone under 18.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>If You are a parent or guardian and You believe Your child has provided Us with Personal Information, please contact Us, and We will delete it.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Links to Other Websites</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>Our Service may contain links to other websites that are not operated by Us. If You click on a third-party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>We have no control over and assume no responsibility for the content, privacy policies or practices of any third-party sites or services.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Changes to this Privacy Policy</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the &quot;Last updated&quot; date at the top of this Privacy Policy.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Contact Us</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>If You have any questions about this Privacy Policy, You can contact Us:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li>By email: support@easemylife.app</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


			</ul>


		</React.Fragment>


	);


}

// #endregion PriPolCom



// #region TerSerCom

/**
 * TerSerCom = Terms Service Component
 *
 * @summary
 * Renders the Terms of Service's own body copy (a title, a run of
 * sections, subsections, paragraphs and lists) as a React.Fragment, so
 * the Settings modal and the standalone /terms page can each drop it into a
 * body of their own.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props - This component does not use any props.
 *
 * @returns The terms' own document markup, wrapped in a Fragment.
 *
 * @example
 * ```tsx
 * TerSerCom({}) // => <TerSerCom />
 * ```
 *
*/

function TerSerCom () : React.JSX.Element {


	return (


		<React.Fragment>{ /* What: Container Fragment Element. Why: The document's own top-level elements need one wrapper so whichever container shows the document can render them as a single child, without adding an extra DOM node of its own. How: This wraps the terms' own heading, sections, and lists below. */ }


			<h1>Terms and Conditions</h1>{ /* What: Document Title Heading Element. Why: This is the document's own top-level heading naming which legal document this is. How: This renders as a plain h1 at the top of the document body. */ }

			<p>Last updated: October 20, 2026</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Please read these terms and conditions carefully before using Our Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Interpretation and Definitions</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<h3>Interpretation</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Definitions</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>For the purposes of these Terms and Conditions:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }



			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Affiliate</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means an entity that controls, is controlled by, or is under common control with a party, where &quot;control&quot; means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Country/State</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to: Missouri,  United States</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Company</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in these Terms and Conditions) refers to Ease My Life.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Device</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means any device that can access the Service such as a computer, a cell phone or a digital tablet.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Service</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to the Website.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Terms and Conditions</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } (also referred to as &quot;Terms&quot;) means these Terms and Conditions, including any documents expressly incorporated by reference, which govern Your access to and use of the Service and form the entire agreement between You and the Company regarding the Service. These Terms and Conditions have been created with the help of the <a
						href='https://www.termsfeed.com/terms-conditions-generator/'
						rel='noopener noreferrer'
						target='_blank'
					>TermsFeed Terms and Conditions Generator</a>{ /* What: Inline Generator Credit Link Element. Why: This credits the third-party generator this legal text was drafted with. How: This opens the linked generator page in a new tab. */ }.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Third-Party Social Media Service</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means any services or content (including data, information, products or services) provided by a third party that is displayed, included, made available, or linked to through the Service.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>Website</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } refers to Ease My Life, accessible from <a
						href='https://www.easemylife.app'
						rel='external nofollow noopener noreferrer'
						target='_blank'
					>https://www.easemylife.app</a>{ /* What: Inline Site Link Element. Why: This points the reader at the app's own live website. How: This opens the site in a new tab. */ }</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


				<li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


					<p><strong>You</strong>{ /* What: Term Label Strong Element. Why: This bolds the defined term at the start of its own definition entry. How: This wraps the term text in a native strong tag for visual emphasis. */ } means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</p>{ /* What: Bolded Lead-In Paragraph Element. Why: This pairs a bolded lead-in term or phrase with the rest of its own sentence, as one entry in the list above it. How: This wraps the lead-in text in a strong element (rendered beside it) followed by the entry's own continuing text. */ }


				</li>


			</ul>



			<h2>Acknowledgment</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>These are the Terms and Conditions governing the use of this Service and the agreement between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Your access to and use of the Service is also subject to Our Privacy Policy, which describes how We collect, use, and disclose personal information. Please read Our Privacy Policy carefully before using Our Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Links to Other Websites</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>Our Service may contain links to third-party websites or services that are not owned or controlled by the Company.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such websites or services.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>We strongly advise You to read the terms and conditions and privacy policies of any third-party websites or services that You visit.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Links from a Third-Party Social Media Service</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>The Service may display, include, make available, or link to content or services provided by a Third-Party Social Media Service. A Third-Party Social Media Service is not owned or controlled by the Company, and the Company does not endorse or assume responsibility for any Third-Party Social Media Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>You acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with Your access to or use of any Third-Party Social Media Service, including any content, goods, or services made available through them. Your use of any Third-Party Social Media Service is governed by that Third-Party Social Media Service's terms and privacy policies.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Paid Sync</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>Sync across devices is an optional, one-time purchase, not a subscription. It unlocks sync for the Account You are signed in with when You buy it, for as long as We offer the Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Purchases are sold and processed by Polar, and refunds are handled through Polar under its refund terms. If a purchase is refunded, sync is turned off for that Account. The data on Your devices is not affected.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Sync relies on services run by others, including Google Firebase and Polar, and We cannot promise it will always be available or free of errors. Keep a backup by exporting Your data from Settings from time to time. If We ever stop offering sync, Ease My Life will keep working on Your devices, and You will still be able to export Your data.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Termination</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Upon termination, Your right to use the Service will cease immediately.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Limitation of Liability</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of these Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven't purchased anything through the Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data or other information, for business interruption, for personal injury, loss of privacy arising out of or in any way related to the use of or inability to use the Service, third-party software and/or third-party hardware used with the Service, or otherwise in connection with any provision of these Terms), even if the Company or any supplier has been advised of the possibility of such damages and even if the remedy fails of its essential purpose.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Some states do not allow the exclusion of implied warranties or limitation of liability for incidental or consequential damages, which means that some of the above limitations may not apply. In these states, each party's liability will be limited to the greatest extent permitted by law.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>&quot;AS IS&quot; and &quot;AS AVAILABLE&quot; Disclaimer</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>The Service is provided to You &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service, including all implied warranties of merchantability, fitness for a particular purpose, title and non-infringement, and warranties that may arise out of course of dealing, course of performance, usage or trade practice. Without limitation to the foregoing, the Company provides no warranty or undertaking, and makes no representation of any kind that the Service will meet Your requirements, achieve any intended results, be compatible or work with any other software, applications, systems or services, operate without interruption, meet any performance or reliability standards or be error free or that any errors or defects can or will be corrected.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Without limiting the foregoing, neither the Company nor any of the company's provider makes any representation or warranty of any kind, express or implied: (i) as to the operation or availability of the Service, or the information, content, and materials or products included thereon; (ii) that the Service will be uninterrupted or error-free; (iii) as to the accuracy, reliability, or currency of any information or content provided through the Service; or (iv) that the Service, its servers, the content, or e-mails sent from or on behalf of the Company are free of viruses, scripts, trojan horses, worms, malware, timebombs or other harmful components.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>Some jurisdictions do not allow the exclusion of certain types of warranties or limitations on applicable statutory rights of a consumer, so some or all of the above exclusions and limitations may not apply to You. But in such a case the exclusions and limitations set forth in this section shall be applied to the greatest extent enforceable under applicable law.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Governing Law</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>The laws of the Country/State, excluding its conflicts of law rules, shall govern these Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Disputes Resolution</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>If You have any concern or dispute about the Service, You agree to first try to resolve the dispute informally by contacting the Company.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>For European Union (EU) Users</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>If You are a European Union consumer, you will benefit from any mandatory provisions of the law of the country in which You are resident.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>United States Legal Compliance</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>You represent and warrant that (i) You are not located in a country that is subject to the United States government embargo, or that has been designated by the United States government as a &quot;terrorist supporting&quot; country, and (ii) You are not listed on any United States government list of prohibited or restricted parties.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Severability and Waiver</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<h3>Severability</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h3>Waiver</h3>{ /* What: Subsection Heading Element. Why: This marks the start of a subsection under the section above it. How: This renders as a plain h3, styled by the prose rules of whatever container it renders into. */ }

			<p>Except as provided herein, the failure to exercise a right or to require performance of an obligation under these Terms shall not affect a party's ability to exercise such right or require such performance at any time thereafter nor shall the waiver of a breach constitute a waiver of any subsequent breach.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Translation Interpretation</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>These Terms and Conditions may have been translated if We have made them available to You on our Service. You agree that the original English text shall prevail in the case of a dispute.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Changes to These Terms and Conditions</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<p>By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, in whole or in part, please stop using the Service.</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<h2>Contact Us</h2>{ /* What: Top-Level Section Heading Element. Why: This marks the start of one of the document's own major sections. How: This renders as a plain h2, styled by the prose rules of whatever container it renders into. */ }

			<p>If you have any questions about these Terms and Conditions, You can contact us:</p>{ /* What: Body Paragraph Element. Why: This is one paragraph of the document's own body copy. How: This is plain static text. */ }

			<ul>{ /* What: Body List Element. Why: This groups a run of related list items under the paragraph or heading above it. How: This renders as a plain ul, styled by the prose rules of whatever container it renders into. */ }


				<li>By email: support@easemylife.app</li>{ /* What: Body List Item Element. Why: This is one entry in the body list above it. How: This renders as a plain li, styled by the prose rules of whatever container it renders into. */ }


			</ul>


		</React.Fragment>


	);


}

// #endregion TerSerCom

// #endregion Components



// #region Exports

export { PriPolCom, TerSerCom }; // What: Named Exports. Why: The Settings modal and the standalone legal pages both render these documents. How: This exports both components by name.

// #endregion Exports


